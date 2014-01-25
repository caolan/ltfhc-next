exports.docs_by_collection = {
    map: function(doc) {
        if (doc.collection) {
            emit(doc.collection, null);
        }
    }
};

exports.reports = {
    map: function(doc) {
        if (doc.collection === 'reports' && doc.class != 'schema') {

            var phone = doc.contact && doc.contact.phone,
                rc_code = doc.contact && doc.contact.rc_code;
            emit(
                [doc.type], {
                    name: doc.name,
                    reporting_period: doc.reporting_period,
                    report_status: doc.report_status,
                    reporter: doc.user
                }
            );
        }
    }
};

exports.reports_entries = {
    map: function(doc) {
        var bucket = "";

        if (doc.collection == 'visits' && doc.class == 'entry') {
            bucket = (doc.patient.approxage < 20) ? "below20" : "above20";

            emit([
                "reports_anc", (doc.anc_first_visit.gestational_age < 12) ? "gestational_age_below_12_weeks" : "gestational_at_week_12_or_more", bucket
            ], {
                indicator: (doc.anc_first_visit.gestational_age < 12) ? "gestational_age_below_12_weeks" : "gestational_at_week_12_or_more",
                bucket: bucket,
            })

            doc.anc_first_visit.gestational_age && emit(
                [
                    "reports_anc", (doc.anc_first_visit.gestational_age) ? "total_attendance_of_first_visits(2a+2b)" : null, bucket
                ], {
                    indicator: (doc.anc_first_visit.gestational_age) ? "total_attendance_of_first_visits(2a+2b)" : null,
                    bucket: bucket
                }
            )

            doc.anc_first_visit.pregnancy_test && emit(
                [
                    "reports_anc", (doc.anc_first_visit.pregnancy_test) ? "number_of_pregnant_women_tested_first_visit" : null, bucket
                ], {
                    indicator: (doc.anc_first_visit.pregnancy_test) ? "number_of_pregnant_women_tested_first_visit" : null,
                    bucket: bucket
                }
            )
        }
    },
    reduce: function(keys, values) {
        var result = {
            indicator: keys[0][0][1],
            total: 0
        }
        for (var idx in values) {
            result[values[idx].bucket] = 0
        }
        for (var idx in values) {
            result[values[idx].bucket] += values[idx] ? 1 : 0
            result["total"] += values[idx] ? 1 : 0
        }

        return result
    }
}

exports.reports_entries2 = {
    map: function(doc) {
        var bucket = "",
            indicator;

        var reports = require("views/lib/reports_schema").reports

        var bucket = (doc.patient.approxage < 20) ? "below20" : "above20";

        if (doc.collection == 'visits' && doc.class == 'entry') {
            for (report in reports) {
                for (indicator in reports[report].properties) {
                    //emit(doc[report.properties[indicator]])
                    fld = reports[report].properties[indicator] && reports[report].properties[indicator].field && reports[report].properties[indicator].field.name
                    op = reports[report].properties[indicator] && reports[report].properties[indicator].field && reports[report].properties[indicator].field.operation
                    if (!~'fld'.indexOf('FIXME') && op && fld) {
                        try {
                            with(doc) {
                                var result = eval('(' + op + ')')
                                result && emit(
                                    [
                                        report, (result) ? indicator : null,
                                        bucket
                                    ], {
                                        report: report,
                                        indicator: (result) ? indicator : null,
                                        bucket: bucket
                                    }
                                )
                            }
                            emit([report, fld, op, result])
                        } catch (e) {
                            if (e instanceof SyntaxError) {
                                emit([report, fld, op, "error in report syntax"])
                            } else {
                                emit([report, fld, op, "other error"])
                            }
                        }
                    }
                }
            }

        }
    },
    reduce: function(keys, values) {
        var result = {
            indicator: keys[0][0][1],
            total: 0
        }
        for (var idx in values) {
            result[values[idx].bucket] = 0
        }
        for (var idx in values) {
            result[values[idx].bucket] += values[idx] ? 1 : 0
            result["total"] += values[idx] ? 1 : 0
        }

        return result
    }
};

exports.reports_fields = {
    map: function(doc) {
        var bucket = "",
            indicator = "";

        if (doc.collection == 'reports' && doc.class == 'schema') {
            for (var prop in doc.properties) {
                var name = doc.properties[prop].field && doc.properties[prop].field.name
                var type = doc.properties[prop].field && doc.properties[prop].field.type
                var operation = doc.properties[prop].field && doc.properties[prop].field.operation
                if (name) emit([name, prop, type, operation])
            }
        }
    },
    reduce: "_count"
};

exports.visits = {
    map: function(doc) {
        if (doc.collection === 'visits' &&
            doc.class == 'entry') {

            var phone = doc.contact && doc.contact.phone,
                rc_code = doc.contact && doc.contact.rc_code;
            emit(
                [doc.type], {
                    name: doc.name,
                    reporting_period: doc.reporting_period,
                    report_status: doc.report_status,
                    reporter: doc.user
                }
            );
        }
    }
};

exports.patients = {
    map: function(doc) {
        if (doc.collection === 'patients' &&
            doc.class == 'entry') {

            emit(
                [doc.collection], {
                    firstname: doc.firstname,
                    lastname: doc.lastname,
                    clinicid: doc.clinicid,
                    governmentid: doc.governmentid,
                    hivid: doc.hivid,
                    phone: doc.phone,
                    approxage: doc.approxage,
                    village: doc.village,
                    district: doc.district
                }
            );
        }
    }
};

exports.facilities = {
    map: function(doc) {
        if (doc.type === 'clinic' ||
            doc.type === 'health_center' ||
            doc.type === 'district_hospital' ||
            doc.type === 'national_office') {

            var phone = doc.contact && doc.contact.phone,
                rc_code = doc.contact && doc.contact.rc_code;
            emit(
                [doc.type], {
                    name: doc.name,
                    contact: doc.contact,
                    rc_code: rc_code,
                    phone: phone
                }
            );
        }
    }
};

exports.facilities_by_district = {
    map: function(doc) {

        var dh_id = null;

        if (doc.type === 'clinic' && doc.parent && doc.parent.parent) {
            dh_id = doc.parent.parent._id;
        } else if (doc.type === 'health_center' && doc.parent) {
            dh_id = doc.parent._id;
        } else if (doc.type === 'district_hospital') {
            dh_id = doc._id;
        }
        if (dh_id !== null) {
            var phone = doc.contact && doc.contact.phone,
                rc_code = doc.contact && doc.contact.rc_code;
            emit(
                [dh_id, doc.type], {
                    name: doc.name,
                    contact: doc.contact,
                    rc_code: rc_code,
                    phone: phone
                }
            );
        }
    }
};

exports.reminders = {
    map: function(doc) {
        var phone,
            refid,
            tasks,
            dh_id = doc.related_entities && doc.related_entities.clinic && doc.related_entities.clinic.parent &&
                doc.related_entities.clinic.parent.parent && doc.related_entities.clinic.parent.parent._id;

        if (doc.type === 'data_record' && doc.form && doc.week_number && doc.year) {
            phone = doc.related_entities && doc.related_entities.clinic && doc.related_entities.clinic.contact &&
                doc.related_entities.clinic.contact.phone;
            refid = doc.related_entities && doc.related_entities.clinic && doc.related_entities.clinic.contact &&
                doc.related_entities.clinic.contact.rc_code;
            if (phone || (refid && refid !== null)) {
                emit([dh_id, doc.year, doc.week_number, phone, refid], 'report received');
            }
        } else if (doc.type === 'weekly_reminder' && doc.related_form && doc.week && doc.year && doc.phone) {
            tasks = doc.tasks;
            state = tasks.length ? tasks[0].state : 'unknown';
            emit([dh_id, doc.year, doc.week, doc.phone, doc.refid], 'reminder ' + state);
        }
    },
    reduce: function(keys, values) {
        return values.reduce(function(memo, value) {
            if (memo === 'report received') {
                return memo;
            } else if (memo === 'reminder sent') {
                return memo;
            } else {
                return value;
            }
        }, 'unknown');
    }
}

exports.contacts_by_id = {
    map: function(doc) {
        var district,
            facility;

        if (~['district_hospital', 'health_center', 'clinic'].indexOf(doc.type)) {
            emit([null, doc._id], null);
        }

        if (doc.type === 'district_hospital') {
            emit([doc._id, doc._id], null);
        } else if (doc.type === 'health_center') {
            district = doc.parent;

            if (district) {
                emit([district._id, doc._id], null);
            }
        } else if (doc.type === 'clinic') {
            facility = doc.parent;
            if (facility) {
                emit([facility._id, doc._id], null);

                district = facility.parent;
                if (district) {
                    emit([district._id, doc._id], null);
                }
            }
        }
    }
};

exports.contacts = {
    map: function(doc) {
        var district,
            facility,
            contact = doc.contact,
            name = doc.name,
            contactName = contact && contact.name,
            code = contact && contact.rc_code,
            phone = contact && contact.phone,
            strippedPhone = phone && phone.replace(/^\+/, ''),
            result;

        function emitWords(district) {
            if (name) {
                name = name.replace(/[^\w\d+\s]/g, '');
                name.trim().split(/\s+/).forEach(function(token) {
                    emit([district, token], doc._id);
                });
            }
            if (contactName) {
                contactName = contactName.replace(/[^\w\d+\s]/g, '');
                contactName.trim().split(/\s+/).forEach(function(token) {
                    emit([district, token], doc._id);
                });
            }
            if (phone) {
                emit([district, phone], doc._id);
            }
            if (strippedPhone && strippedPhone !== phone) {
                emit([district, strippedPhone], doc._id);
            }
            if (code) {
                emit([district, code], doc._id);
            }
        }

        if (~['district_hospital', 'health_center', 'clinic'].indexOf(doc.type)) {
            emitWords(null);
        }

        if (doc.type === 'district_hospital') {
            emitWords(doc._id);
        } else if (doc.type === 'health_center') {
            district = doc.parent;

            if (district) {
                emitWords(district._id);
            }
        } else if (doc.type === 'clinic') {
            facility = doc.parent;
            if (facility) {
                emitWords(facility._id);

                district = facility.parent;
                if (district) {
                    emitWords(district._id);
                }
            }
        }
    }
};

exports.data_records_by_district_and_form = {
    map: function(doc) {
        var objectpath = require('views/lib/objectpath'),
            dh;

        if (doc.type === 'data_record') {
            dh = objectpath.get(doc, 'doc.related_entities.clinic.parent.parent');

            if (dh) {
                emit([dh._id, doc.form, dh.name], 1);
            } else {
                emit([null, doc.form, null], 1);
            }
        }
    },
    reduce: function(key, counts) {
        return sum(counts);
    }
};

exports.data_records = {
    map: function(doc) {
        var objectpath = require('views/lib/objectpath'),
            clinicId,
            centerId,
            districtId,
            form = doc.form,
            valid;

        if (doc.type === 'data_record') {
            clinicId = objectpath.get(doc, 'related_entities.clinic._id');
            centerId = objectpath.get(doc, 'related_entities.clinic.parent._id');
            districtId = objectpath.get(doc, 'related_entities.clinic.parent.parent._id');
            valid = !doc.errors || doc.errors.length === 0;

            emit([doc.reported_date], 1);
            emit([valid, doc.reported_date], 1);

            if (form) {
                emit([form, doc.reported_date], 1);
                emit([valid, form, doc.reported_date], 1);

                emit(['*', doc.reported_date], 1);
                emit([valid, '*', doc.reported_date], 1);
            } else {
                emit(['null_form', doc.reported_date], 1);
                emit([valid, 'null_form', doc.reported_date], 1);
            }

            if (clinicId) {
                emit([clinicId, doc.reported_date], 1);
                emit([valid, clinicId, doc.reported_date], 1);

                if (form) {
                    emit([clinicId, form, doc.reported_date], 1);
                    emit([valid, clinicId, form, doc.reported_date], 1);

                    emit([clinicId, '*', doc.reported_date], 1);
                    emit([valid, clinicId, '*', doc.reported_date], 1);
                } else {
                    emit([clinicId, 'null_form', doc.reported_date], 1);
                    emit([valid, clinicId, 'null_form', doc.reported_date], 1);
                }
            }
            if (centerId) {
                emit([centerId, doc.reported_date], 1);
                emit([valid, centerId, doc.reported_date], 1);

                if (form) {
                    emit([centerId, form, doc.reported_date], 1);
                    emit([valid, centerId, form, doc.reported_date], 1);

                    emit([centerId, '*', doc.reported_date], 1);
                    emit([valid, centerId, '*', doc.reported_date], 1);
                } else {
                    emit([centerId, 'null_form', doc.reported_date], 1);
                    emit([valid, centerId, 'null_form', doc.reported_date], 1);
                }
            }
            if (districtId) {
                emit([districtId, doc.reported_date], 1);
                emit([valid, districtId, doc.reported_date], 1);

                if (form) {
                    emit([districtId, form, doc.reported_date], 1);
                    emit([valid, districtId, form, doc.reported_date], 1);

                    emit([districtId, '*', doc.reported_date], 1);
                    emit([valid, districtId, '*', doc.reported_date], 1);
                } else {
                    emit([districtId, 'null_form', doc.reported_date], 1);
                    emit([valid, districtId, 'null_form', doc.reported_date], 1);
                }
            }
            if (clinicId && districtId) {
                emit([districtId, clinicId, doc.reported_date], 1);
                emit([valid, districtId, clinicId, doc.reported_date], 1);

                if (form) {
                    emit([districtId, clinicId, form, doc.reported_date], 1);
                    emit([valid, districtId, clinicId, form, doc.reported_date], 1);

                    emit([districtId, clinicId, '*', doc.reported_date], 1);
                    emit([valid, districtId, clinicId, '*', doc.reported_date], 1);
                } else {
                    emit([districtId, clinicId, 'null_form', doc.reported_date], 1);
                    emit([valid, districtId, clinicId, 'null_form', doc.reported_date], 1);
                }
            }
            if (centerId && districtId) {
                emit([districtId, centerId, doc.reported_date], 1);
                emit([valid, districtId, centerId, doc.reported_date], 1);

                if (form) {
                    emit([districtId, centerId, form, doc.reported_date], 1);
                    emit([valid, districtId, centerId, form, doc.reported_date], 1);

                    emit([districtId, centerId, '*', doc.reported_date], 1);
                    emit([valid, districtId, centerId, '*', doc.reported_date], 1);
                } else {
                    emit([districtId, centerId, 'null_form', doc.reported_date], 1);
                    emit([valid, districtId, centerId, 'null_form', doc.reported_date], 1);
                }
            }
        }
    }
};


// only emit valid records with a form
exports.data_records_valid_by_district_and_form = {
    map: function(doc) {
        var objectpath = require('views/lib/objectpath'),
            dh;

        if (doc.type === 'data_record' && doc.form) {
            dh = objectpath.get(doc, 'related_entities.clinic.parent.parent') || objectpath.get(doc, 'related_entities.health_center.parent');

            if (!doc.errors || doc.errors.length === 0) {
                if (dh) {
                    emit([dh._id, doc.form, dh.name], 1);
                } else {
                    emit([null, doc.form, null], 1);
                }
            }
        }
    },
    reduce: function(key, counts) {
        return sum(counts);
    }
};

exports.data_records_by_district = {
    map: function(doc) {
        var objectpath = require('views/lib/objectpath'),
            dh;

        if (doc.type === 'data_record') {
            dh = objectpath.get(doc, 'related_entities.clinic.parent.parent');

            if (dh && dh.type === 'district_hospital') {
                emit([dh._id, dh.name], null);
            }
        }
    },

    reduce: function(key, doc) {
        return true;
    }
};

exports.data_records_by_district_and_clinic = {
    map: function(doc) {
        var objectpath = require('views/lib/objectpath'),
            dh,
            cl,
            contact;

        if (doc.type === 'data_record') {
            dh = objectpath.get(doc, 'related_entities.clinic.parent.parent');
            cl = objectpath.get(doc, 'related_entities.clinic');
            contact = objectpath.get(doc, 'related_entities.clinic.contact') || {};

            if (dh && dh.type === 'district_hospital') {
                emit([dh._id, cl._id, cl.name, contact.name || contact.rc_code || contact.phone], null);
            }
        }
    },
    reduce: function(key, doc) {
        return true;
    }
};


exports.data_record_by_phone_and_week = {
    map: function(doc) {
        if (doc.type === 'data_record') {
            emit([doc.from, doc.week, doc._id], doc);
        }
    }
};

/*
 * Get facility based on phone number
 */

exports.facility_by_phone = {
    map: function(doc) {
        if (doc.contact && doc.type) {
            if (doc.type === 'clinic') {
                emit([doc.contact.phone, 'clinic'], doc);
            } else if (doc.type === 'health_center') {
                emit([doc.contact.phone, 'health_center'], doc);
            } else if (doc.type === 'district_hospital') {
                emit([doc.contact.phone, 'district_hospital'], doc);
            }
        }
    }
};

exports.facility_by_parent = {
    map: function(doc) {
        if (doc.type === 'clinic' || doc.type === 'health_center' || doc.type === 'district_hospital') {
            emit([doc.parent._id, doc.name, doc.type], true);
        }
    }
};

/*
 * Get clinic based on phone number
 */
exports.clinic_by_phone = {
    map: function(doc) {
        if (doc.type === 'clinic' && doc.contact) {
            emit([doc.contact.phone], doc);
        }
    }
};

/*
 * Get clinic based on health center phone number
 */
exports.clinic_by_parent_phone = {
    map: function(doc) {
        var objectpath = require('views/lib/objectpath'),
            phone = objectpath.get(doc, 'parent.contact.phone');

        if (doc.type === 'clinic' && phone) {
            emit([phone], doc);
        }
    }
};

/*
 * Get clinic based on referral id (refid) in a tasks_referral doc.
 */
exports.clinic_by_refid = {
    map: function(doc) {
        if (doc.type === 'clinic' && doc.contact && doc.contact.rc_code) {
            // need String because rewriter wraps everything in quotes
            // keep refid case-insenstive since data is usually coming from SMS
            emit([String(doc.contact.rc_code).toUpperCase()], doc);
        }
    }
};

exports.tasks_pending = {
    map: function(doc) {
        var has_pending,
            tasks = doc.tasks || [],
            scheduled_tasks = doc.scheduled_tasks || [];

        /*
         * Required fields for message to be processed:
         *  task `state` value must be 'pending'
         *  message needs the `to` and `message` properties
         */

        function hasPending(tasks) {
            var has = false,
                tasks = tasks || [];
            tasks.forEach(function(task) {
                if (task && task.state === 'pending') {
                    task.messages.forEach(function(msg) {
                        if (msg && msg.to && msg.message) {
                            has = true;
                        }
                    });
                }
            });
            return has;
        }

        // check tasks
        has_pending = hasPending(doc.tasks);

        // if still not pending check scheduled_tasks too.  also, only process
        // scheduled tasks if doc has no errors.
        if (!has_pending && (!doc.errors || doc.errors.length === 0)) {
            has_pending = hasPending(doc.scheduled_tasks);
        }

        if (has_pending) {
            emit([doc.reported_date, doc.refid]);
        }
    }
};

exports.tasks_sent = {
    map: function(doc) {
        var has_sent,
            tasks = doc.tasks || [],
            scheduled_tasks = doc.scheduled_tasks || [];

        has_sent = tasks.some(function(task) {
            return task.state === 'sent';
        });

        // check scheduled tasks too if not already sent
        if (!has_sent) {
            has_sent = scheduled_tasks.some(function(task) {
                return task.state === 'sent';
            });
        }

        if (has_sent) {
            emit([doc.reported_date, doc.refid]);
        }
    }
};

exports.data_record_by_year_month_and_clinic_id = {
    map: function(doc) {
        if (doc.type === 'data_record' && doc.related_entities && doc.related_entities.clinic) {
            emit([doc.year, doc.month, doc.related_entities.clinic._id], doc);
        }
    }
};

/*
 * Emit the sms_message.sent_timestamp string as created by gateway.
 */
exports.sms_message_by_sent_timestamp = {
    map: function(doc) {
        if (doc.type === 'data_record') {
            var sms = doc.sms_message;
            if (sms) {
                emit([sms.sent_timestamp, sms.form, sms.from], null);
            }
        }
    }
};

// Emit lists
exports.viewlist = {
    map: function(doc) {
        if (doc.class === 'lists') {
            emit(
                doc.collection, {
                    order: doc.order,
                    name: doc.en
                });
        }
    }
};