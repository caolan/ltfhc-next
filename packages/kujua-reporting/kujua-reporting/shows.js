var db = require('db'),
    utils = require('./utils'),
    kutils = require('kujua-utils'),
//    sms_utils = require('kujua-sms/utils'),
    appname = require('settings/root').name,
    duality = require('duality/core'),
    events = require('duality/events'),
    users = require('users'),
    charts = require('./ui/charts'),
    templates = require('duality/templates'),
//    info = require('views/lib/appinfo'),
//    jsonforms = require('views/lib/jsonforms'),
	url_util = require('url');

var facility_doc
    , _req
    , dates
    , isAdmin
    , isDistrictAdmin
    , userDistrict;

var getViewReports = function(doc, dates, callback) {
    var args = utils.getReportingViewArgs(dates),
        view = 'data_records_by_form_year_month_facility';

    if (dates.reporting_freq === 'week') {
        view = 'data_records_by_form_year_week_facility';
    }

    var appdb = db.use(duality.getDBURL());
    appdb.getView(appname, view, args, function(err, data) {
        if (err) {
            callback(
                'Error: '+ err + '\n' + 'Args: ' + JSON.stringify(args)
            );
            return;
        }
        // additional filtering for this facility
        var saved_data = [];
        var idx = doc.type === 'health_center' ? 4 : 3;
        for (var i in data.rows) {
            if (doc._id === data.rows[i].key[idx]) {
                // keep orig ordering
                saved_data.unshift(data.rows[i]);
            }
        }
        callback(null,saved_data);
    });
};

/*
 * Return data from couch view with some filtering.  Allows you to pass in a
 * facility doc and get related facility data.
 */
var getViewChildFacilities = function(doc, callback) {
    var startkey = [],
        endkey = [],
        view = 'total_clinics_by_facility',
        args = {
            group: true
        };

    if (doc.type === 'district_hospital') {
        // filter on district
        startkey.push(doc._id);
        endkey.push(doc._id, {}); // {} couchdb endkey trick
    } else if (doc.type === 'health_center') {
        // filter on health center
        startkey.push(doc.parent._id, doc._id);
        endkey.push(doc.parent._id, doc._id, {});
    } else {
        throw new Error('Doc not currently supported.');
    }

    args.startkey = startkey;
    args.endkey = endkey;

    var appdb = db.use(duality.getDBURL());
    appdb.getView(appname, view, args, function(err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, data);
        }
    });

};

/*
 *  Given a facility doc exec a callback with view data of doc ids and
 *  names of sibling facilities.
 */
var getViewSiblingFacilities = function(doc, callback) {

    var args = {startkey: [], endkey: []};

    if (!doc.type) {
        throw new Error('Doc without type attribute not supported.');
    }

    args.startkey.push(doc.type, doc.parent._id);
    args.endkey.push(doc.type, doc.parent._id, {}); // {} couchdb endkey trick

    var appdb = db.use(duality.getDBURL());
    appdb.getView(appname, 'facilities_by_parent', args, function(err, data) {
        if (err) { return alert(err); }
        callback(data);
    });

};

var renderRelatedFacilities = function(req, doc, selector) {
    selector = selector || '#facilities_related';
    var related = [];
    var appendRelated = function(d) {
        var p = d.related_entities ? d.related_entities.clinic : d.parent;
        if(p && p.name) {
            related.push({
                title: $.kansotranslate(utils.viewHeading(p.type)),
                name: p.name
            });
            if (p.parent) { appendRelated(p); }
        }
    };
    appendRelated(doc);
    $(selector).html(
        templates.render('kujua-reporting/facilities_related.html', req, {
            related: related
        })
    );

};

var renderReportingTotals = function(totals, doc) {

    if (doc.type === 'health_center') {
        $('#totals h4').each(function(i,el) {
            switch (i) {
                case 0: $(el).text(Object.keys(totals.clinics).length);
                        break;
                case 1: $(el).text(totals.complete);
                        break;
                case 2: $(el).text(totals.not_submitted);
                        break;
                case 3: $(el).text(totals.incomplete);
                        break;
            }
        });
    } else {
        $('#totals h4').each(function(i,el) {
            switch (i) {
                case 0: $(el).text(Object.keys(totals.health_centers).length);
                        break;
                case 1: $(el).text(Object.keys(totals.clinics).length);
                        break;
                case 2: $(el).text(totals.not_submitted);
                        break;
                case 3: $(el).text(totals.incomplete);
                        break;
            }
        });
    }

    var chart = charts.pie(
        [totals.incomplete, totals.not_submitted, totals.complete],
        {selector: '#totals .chart',
         cx: 110,
         cy: 150,
         radius: 100,
         labels: [totals.incomplete_percent+'%',
                  totals.not_submitted_percent+'%',
                  totals.complete_percent+'%'],
         fill: ['#CA410B', '#CBCBCB', '#8EB51C']});

    var popup = null;

    var closePopup = function (ev) {
        if (popup) {
            popup.uPopup('destroy', function () {
                popup = null;
            });
        }
    };

    var closePopupIfOutside = function (ev) {
        var toElementIsSvgPath = $(ev.toElement).parents('svg').length > 0;
        var toElementIsPopup = $(ev.toElement).parents('.upopup').length > 0;

        if(!toElementIsSvgPath && !toElementIsPopup) {
            closePopup();
        }
    };

    var drawPopup = function (ev, elt, selector) {
        var inner_elt = $('#popup-' + selector);

        if (popup) {
            popup.uPopup('recalculate', { eventData: ev });
        } else {
            popup = $('#popup-base').uPopup('create', elt, {
                eventData: ev,
                useCorners: false,
                invertPlacement: true,
                cssClasses: 'upopup-square'
            });
        }

        $('.upopup').unbind('mouseout');
        $('.upopup').bind('mouseout', closePopupIfOutside);

        popup.html(inner_elt.clone(true));
        $('.count', popup).html(totals[selector]);

        $('.percent', popup).html(
            $(elt).next('text').find('tspan').text()
        );
    };

    $('body').bind('click', closePopup);
    $('svg').bind('mouseout', closePopupIfOutside);

    $('svg circle').each(function(i, c) {
        $(c).mousemove(function (ev) {
            var selector;
            _.each(['incomplete', 'not_submitted', 'complete'], function(label) {
                if(totals[label] > 0) {
                    selector = label;
                }
            });
            //drawPopup(ev, c, selector);
        });
    });

    $('svg path').each(function(i, s) {
        $(s).mousemove(function (ev) {
            s = $(s);
            var selector;
            switch (s.prevAll('path').length) {
                case 0:
                    selector = 'incomplete';
                    break;
                case 1:
                    selector = 'not_submitted';
                    break;
                case 2:
                    selector = 'complete';
                    break;
            }
            //drawPopup(ev, s, selector);
        });
    });

};



//
// render record details when a row is clicked
//
var onRecordClick = function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    var $tr = $(ev.currentTarget),
        id = $tr.attr('rel'),
        req = {};
    // get target el from event context
    var row = $tr.next('.data-record-details'),
        cell = row.children('td'),
        body = cell.html();

    if (body === '') {
        row.show();
        cell.show();
        cell.html('<div class="loading">Loading...</div>');
        var appdb = db.use(duality.getDBURL());
        appdb.getDoc(id, function(err, resp) {
            if (err) {
                var msg = 'Error fetching record with id '+ id +'.  '
                            + 'Try a refresh or check the database connection. '
                            + err;
                kutils.logger.warn(msg);
                return alert(msg);
            }
            cell.html(
                templates.render(
                    "kujua-reporting/data_records_table.html",
                    req,
                    {data_records: sms_utils.makeDataRecordReadable(resp)}
                )
            );
        });
    } else {
        row.toggle();
    }
};

function renderReporting(doc, req) {
    var template = 'kujua-reporting/facility.html',
        appInfo = info.getAppInfo.apply(this);

    _req = req;
    isAdmin = kutils.isUserAdmin(req.userCtx);
    isDistrictAdmin = kutils.isUserDistrictAdmin(req.userCtx);
    facility_doc = doc;
    dates = utils.getDates(req.query);

    if (utils.isHealthCenter(doc)) {
        template = 'kujua-reporting/facility_hc.html';
    }

    events.once('afterResponse', function() {

        kutils.updateTopNav('reporting_rates');

        if (!isAdmin && !isDistrictAdmin) {
            // not logged in or roles is not setup right
            return $('[data-page=reporting_rates] #content').html(
                templates.render("403.html", req, {})
            );
        }
        users.get(req.userCtx.name, function(err, user) {

            if (err) {
                return kutils.logger.warn('Failed to retreive user info: '+err.reason);
            }

            userDistrict = user.facility_id;
            if (isAdmin || (isDistrictAdmin && userDistrict)) {
                renderPage();
            } else {
                return $('[data-page=reporting_rates] #content').html(
                    templates.render("500.html", req, {
                        msg: 'No facility assigned to district admin.'
                    })
                );
            }
        });
    });

    if (doc) {
        // TODO fix show when $.kansotranslate is not available
        return {
            title: doc.name,
            info: appInfo,
            content: templates.render(template, req, {
                doc: doc
            })
        };
    } else {
        return {
            title: "Reporting Rates",
            info: appInfo,
            content: templates.render("loader.html", req, {})
        }
    }

};

function renderPage() {
    var appdb = db.use(duality.getDBURL()),
        appInfo = info.getAppInfo(),
        forms = appInfo['kujua-reporting'],
        doc = facility_doc,
        form_config,
        parentURL = '',
        req = _req,
        title;

    if (!doc) {
        return renderDistrictChoice(appdb, forms);
    }

    // check that form code is setup in config
    form_config = _.findWhere(forms, {
        code: req.query.form
    });

    // Make sure form config is valid.
    if (!form_config || !form_config.code || !form_config.reporting_freq) {
        return $('[data-page=reporting_rates] #content').html(
            templates.render("500.html", req, {
                doc: doc,
                msg: 'Please add a form to your Schedule Reports settings.'
            })
        );
    }

    title = sms_utils.getFormTitle(form_config.code);

    dates = utils.getDates(req.query, form_config.reporting_freq);

    if (utils.isHealthCenter(doc)) {
        parentURL = utils.getReportingUrl(doc.parent._id, dates);
    } else if (utils.isDistrictHospital(doc)) {
        parentURL = 'reporting';
    }

    // render header
    $('[data-page=reporting_rates] .page-header .container').html(
        templates.render('kujua-reporting/page_header_body.html', req, {
            doc: _.extend({}, doc, form_config, {
                title: title
            }),
            parentURL: parentURL
        })
    );
    $('.page-header .container').addClass('reporting');
    $('body > .container .content').filter(':first').attr('class','content-reporting');

    // render date nav
    $('[data-page=reporting_rates] #date-nav .row').html(
        templates.render('kujua-reporting/date_nav.html', req, {
            date_nav: utils.getDateNav(dates, form_config.reporting_freq),
            _id: doc._id,
            form: dates.form
        })
    );

    getViewChildFacilities(doc, renderReports);
}

function renderDistrictChoice(appdb, forms) {

    var f = [];

    _.each(forms, function(form, idx) {
        var def = jsonforms.getForm(form.code),
            formName = sms_utils.getFormTitle(form.code);
        if (def) {
            f.push(_.extend(form, {
                formName: formName
            }));
        }
    });

    forms = f;

    appdb.getView(appname, 'facilities_by_type', {
        startkey: ['health_center'],
        endkey: ['health_center', {}],
        reduce: false,
        include_docs: true
    }, function(err, data) {

        var districts = {};
        _.each(data.rows, function(row) {
            var id = row.doc.parent && row.doc.parent._id;
            if (id && (isAdmin || (isDistrictAdmin && id === userDistrict))) {
                if (!districts[id]) {
                    districts[id] = {
                        id: id,
                        name: row.doc.parent.name,
                        children: [row.doc]
                    };
                } else {
                    districts[id]['children'].push(row.doc);
                }
            }

        });

        // make array for template
        var districts_list = [];
        _.each(districts, function(obj, key) {
            districts_list.push(obj);
        });

        districts_list.sort(function(a, b) {
            if (a.name === b.name) {
                return 0;
            } else {
                return a.name < b.name ? -1 : 1;
            }
        });

        $('[data-page=reporting_rates] #content').html(
            templates.render("kujua-reporting/reporting_district_choice.html", {}, {
                forms: forms,
                one_form: forms.length === 1,
                districts: districts_list
            })
        ).off('click', '#reporting-district-choice .form-name')
         .on('click', '#reporting-district-choice .form-name', function(ev) {
            ev.preventDefault();
            $(this).siblings().slideToggle();
        });
    });

}

var renderReports = function(err, facilities) {

    var doc = facility_doc
        , req = _req
        , rows = []
        , template = 'kujua-reporting/facility.html'
        , data_template = 'kujua-reporting/facility_data.html'
        , getReportingData = utils.getRows;

    if (utils.isHealthCenter(doc)) {
        template = 'kujua-reporting/facility_hc.html';
        data_template = 'kujua-reporting/facility_data_hc.html';
        getReportingData = utils.getRowsHC;
    }

    getViewReports(doc, dates, function(err, reports) {
        if (err) {
            kutils.logger.warn(err);
        }
        var totals = utils.getTotals(facilities, reports, dates);
        renderReportingTotals(totals, doc);
        rows = getReportingData(facilities, reports, dates, doc);

        $('#reporting-data').html(
            templates.render(data_template, req, {
                rows: rows,
                doc: doc
            })
        );

        $('#reporting-data .valid-percent').each(function(i, el) {
            var val = parseInt($(el).text().replace(/%/,''), 10);
            var paper = $(el).children('.mini-pie');
            $(paper).css({'width': '25px', 'height': '25px'});
            var color = Raphael.hsb(val/300, .75, .85);

            if (val === 0) {
                paper.addClass('icon-remove-sign');
            } else if (val == 100) {
                paper.addClass('icon-ok-sign');
            } else {
                var chart = charts.pie(
                    [val, 100 - val],
                    {selector: paper.get(0),
                     cx: 12,
                     cy: 12,
                     radius: 12,
                     fill: [color, '#CBCBCB']});
            }
        });

        $('#reporting-data .facility-link').click(function(ev) {
            if ($(ev.target).closest('button').length === 0) {
                ev.preventDefault();
                ev.stopPropagation();
                $(this).toggleClass('expanded')
                    .next('tr')
                    .children('td')
                    .children('div')
                    .slideToggle();
            }
        });


        $('.facility-link:first').addClass('expanded');
        $('.data-records-list div').hide().first().show();

        // bind click on rows that have data
        $('#reporting-data .data-records .data-record[rel]').click(function(e) {
            if ($(e.target).closest('button').length === 0) {
                onRecordClick(e);
            }
        });

        renderRelatedFacilities(req, doc);

        // only render sibling menu if we are admin and looking at a district
        if (isAdmin || doc.type !== 'district_hospital') {
            // show siblings menu
            $('.nav.facilities').show();

            getViewSiblingFacilities(doc, function(data) {
                $('.nav.facilities .dropdown-menu').html(
                    templates.render(
                        'kujua-reporting/siblings-umenu-item.html', req, {
                            rows: data.rows,
                            form: req.query.form
                    })
                );
            });
        }
    });
}

/**
 * Reporting rates of a facility
 */
exports.facility_reporting = renderReporting;

