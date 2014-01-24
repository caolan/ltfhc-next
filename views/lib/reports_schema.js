exports.reports = {
	"report_anc": {
		"collection": "reports",
		"class": "schema",
		"_id": "reports_anc",
		"$schema": "http://json-schema.org/draft-04/schema#",
		"title": "Report ANC",
		"type": "object",
		"properties": {
			"number_of_expected_pregnant_women": {
				"line_number": "1",
				"sw": "Idadi ya Wajawazito Waliotegemewa",
				"en": "Number of expected pregnant women"
			},
			"first_visit": {
				"line_number": "2",
				"sw": "Hudhurio la kwanza",
				"en": "First visit"
			},
			"gestational_age_below_12_weeks": {
				"line_number": "2a",
				"sw": "Umri wa mimba chini ya wiki 12 (<12weeks)",
				"en": "Gestational age below 12 weeks(<12weeks)",
				"field": {
					"name": "anc_first_visit.gestational_age",
					"operation": "anc_first_visit.gestational_age<12"
				}
			},
			"gestational_at_week_12_or_more": {
				"line_number": "2b",
				"sw": "Umri wa mimba wiki 12 au zaidi (12+ weeks)",
				"en": "Gestational at week 12 or more (12+weeks)",
				"field": {
					"name": "anc_first_visit.gestational_age",
					"operation": "anc_first_visit.gestational_age>=12"
				}
			},
			"total_attendance_of_first_visits(2a+2b)": {
				"line_number": "2c",
				"sw": "Jumla ya hudhurio la Kwanza (2a+2b)",
				"en": "Total attendance of first visits(2a+2b)",
				"field": {
					"name": "anc_first_visit.gestational_age",
					"operation": "anc_first_visit.gestational_age"
				}
			},
			"clients_for_return_visits": {
				"line_number": "2d",
				"sw": "Wateja wa marudio",
				"en": "clients for return visits",
				"field": {
					"name": "anc_followup.total_visits",
					"type": "count"
				}
			},
			"fourth_visits_for_all_pregnant_women": {
				"line_number": "2e",
				"sw": "Hudhurio la nne wajawazito wote",
				"en": "Fourth visits for all pregnant women",
				"field": {
					"name": "anc_followup.fourth_visits",
					"type": "count"
				}
			},
			"total_attendance": {
				"line_number": "2f",
				"sw": "Jumla ya Mahudhurio yote (2c+2d)",
				"en": "total attendance(2c+2d)",
				"field": {
					"name": [
						"anc_first_visit",
						"anc_followup"
					],
					"type": "sum"
				}
			},
			"number_of_pregnant_women_tested_first_visit": {
				"line_number": "2g",
				"sw": "Idadi ya wajawazito waliopima damu hudhurio la kwanza",
				"en": "Number of pregnant women who tested during the first visit at the clinic",
				"field": {
					"name": "anc_first_visit.pregnancy_test",
					"type": "count"
				}
			},
			"pregnant_women_who_received_vaccination_of_tt2": {
				"line_number": "3",
				"sw": "Wajawazito waliopata Chanjo ya TT2+:",
				"en": "Pregnant women who received vaccination of TT2+",
				"field": {
					"name": "anc_first_visit.tt2plus_vaccine",
					"type": "count"
				}
			},
			"risk_factors": {
				"line_number": "4",
				"sw": "Vidokezo vya Hatari:",
				"en": "Risk factors"
			},
			"conceived_more_than_four_times": {
				"line_number": "4a",
				"sw": "Mimba zaidi ya 4:",
				"en": "conceived more than four times",
				"field": {
					"name": "anc_first_visit.number_pregnancy",
					"type": "sum"
				}
			},
			"age_less_than_20_years": {
				"line_number": "4b",
				"sw": "Umri chini ya miaka 20:",
				"en": "age less than 20 years",
				"field": {
					"name": "patient.patient_age",
					"type": "if",
					"operation": "< 20"
				}
			},
			"age_over_35_years": {
				"line_number": "4c",
				"sw": "Umri zaidi ya miaka 35:",
				"en": "age over 35 years",
				"field": {
					"name": "patient.patient_age",
					"type": "if",
					"operation": "> 35"
				}
			},
			"severe_anemia_first_attendance": {
				"line_number": "4d",
				"sw": "Upungufu mkubwa wa damu <8.5g/dl - Anaemia hudhurio Ia kwanza:",
				"en": "severe anemia <8.5g/dl - Anaemia first attendance",
				"field": {
					"name": "anc_first_visit.anemia",
					"type": "count"
				}
			},
			"blood_pressure_high": {
				"line_number": "4e",
				"sw": "Shinikizo Ia damu (BP => 140/90mm/hg):",
				"en": "blood pressure (BP => 140/90mm/hg):",
				"field": {
					"name": ["anc_first_visit.bp_systolic", "anc_followup.bp_systolic", "anc_first_visit.bp_diastolic", "anc_followup.bp_diastolic"],
					"operation": "((anc_first_visit.bp_systolic || anc_followup.bp_systolic) >= 140) && ((anc_first_visit.bp_diastolic || anc_followup.bp_diastolic) >= 90)",
					"type": "sum"
				}
			},
			"heart_disease": {
				"line_number": "4f",
				"sw": "Ugonjwa wa moyo:",
				"en": "Heart disease",
				"field": {
					"name": "anc_first_visit.pregnancy_diseases",
					"operation": "== 'Heart Disease'",
					"type": "count"
				}
			},
			"diabetes": {
				"line_number": "4g",
				"sw": "Kisukari:",
				"en": "Diabetes",
				"field": {
					"name": "anc_first_visit.pregnancy_diseases",
					"operation": "== 'Diabetes'",
					"type": "sum"
				}
			},
			"tuberculosis": {
				"line_number": "4h",
				"sw": "Kifua kikuu:",
				"en": "Tuberculosis",
				"field": {
					"name": "anc_first_visit.pregnancy_diseases",

					"operation": "== 'Tuberculosis'",
					"type": "count"
				}
			},
			"those_who_tested_for_syphillus": {
				"line_number": "4i",
				"sw": "Waliopima Kaswendwe:",
				"en": "Those who tested for Syphillus",
				"field": {
					"name": ["anc_first_visit.syphillus_test", "anc_followup.syphillus_test"],
					"type": "count"
				}
			},
			"those_who_were_infected_with_syphilis": {
				"line_number": "4j",
				"sw": "Waliogundulika na maambukizi ya Kaswende:",
				"en": "Those who were infected with Syphillus",
				"field": {
					"name": ["anc_first_visit.syphillus_status", "anc_followup.syphillus_status"],
					"type": "count"
				}
			},
			"those_who_got_syphillis_treatment": {
				"line_number": "4k",
				"sw": "Waliopata matibabu ya Kaswende:",
				"en": "Those who got Syphillis treatment",
				"field": {
					"name": ["anc_first_visit.syphillus_treatment", "anc_followup.syphillus_treatment"],
					"type": "count"
				}
			},
			"partners_husbands_who_tested_for_syphillis": {
				"line_number": "4l",
				"sw": "Wenza/Waume waliopima Kaswende:",
				"en": "Patners/husbands who tested for Syphillis",
				"field": {
					"name": ["anc_first_visit.partner_syphillus_test", "anc_followup.partner_syphillus_test"],
					"type": "count"
				}
			},
			"patners_husbands_who_were_infected_with_syphilis": {
				"line_number": "4m",
				"sw": "Wenza/Waume Waliogundulika na maambukizi ya Kaswende:",
				"en": "Patners/husbands who were infected with Syphilis",
				"field": {
					"name": ["anc_first_visit.partner_syphillus_status", "anc_followup.partner_syphillus_status"],
					"type": "count"
				}
			},
			"patners_husbands_who_got_treatment_for_syphilis": {
				"line_number": "4n",
				"sw": "Wenza/waume waliopata matibabu ya Kaswende:",
				"en": "Patners/husbands who got treatment for Syphilis",
				"field": {
					"name": ["anc_first_visit.partner_syphillus_treatment", "anc_followup.partner_syphillus_treatment"],
					"type": "count"
				}
			},
			"pregnant_women_who_were_infected_with_stds": {
				"line_number": "4o",
				"sw": "Waliopatikana na magoniwa ya mambukizo ya ngono:",
				"en": "Pregnant women who were infected with STD's",
				"field": {
					"name": ["anc_first_visit.std_status", "anc_followup.std_status"],
					"type": "count"
				}
			},
			"patners_husbands_who_were_infected_with_stds": {
				"line_number": "4p",
				"sw": "Wenzi/waume Waliopatikana na magonjwa ya mambukizo ya ngono:",
				"en": "Patners/husbands who were infected with STD's",
				"field": {
					"name": ["anc_first_visit.partner_std", "anc_followup.partner_std"],
					"type": "count"
				}
			},
			"pregnant_women_who_got_appropriate_treatment_for_stds": {
				"line_number": "4q",
				"sw": "Waliopata tiba sahihi ya magonjwa ya ngono:",
				"en": "Pregnant women who got appropriate treatment for STD's",
				"field": {
					"name": ["anc_first_visit.std_treatment", "anc_followup.std_treatment"],
					"type": "count"
				}
			},
			"patners_who_got_approprite_treatment_for_stds": {
				"line_number": "4r",
				"sw": "Wenzi/waume waliooata tiba sahihi ya magoniwa ya ngono:",
				"en": "Patners who got appropriate treatment for STD's",
				"field": {
					"name": ["anc_first_visit.partner_std_treatment", "anc_followup.partner_std_treatment"],
					"type": "count"
				}
			},
			"pmtct": {
				"line_number": "5",
				"sw": "PMTCT:",
				"en": "PMTCT"
			},
			"pw_who_were_already_infected_by_hiv_before_starting_clinic": {
				"line_number": "5a",
				"sw": "Tayari wana maambukizi ya VVU kabla ya kuanza kliniki:",
				"en": "PW who were already infected by HIV before starting Clinic",
				"field": {
					"name": ["hiv_pregnancy_clinic.hiv_status_prior_firstvisit", "anc_followup.hiv_status_prior_firstvisit", "anc_first_visit.hiv_status_prior_firstvisit"],
					"type": "count"
				}
			},
			"pw_who_were_counselled_before_testing_for_hiv": {
				"line_number": "5b",
				"sw": "Wajawazito wote waliopata ushauri nasaha kabla ya kupima VVU kliniki:",
				"en": "PW who were counselled before testing for HIV",
				"field": {
					"name": ["hiv_pregnancy_clinic.counseled_hiv_prior_test", "anc_first_visit.counseled_hiv_prior_test", "anc_followup.counseled_hiv_prior_test"],
					"type": "count"
				}
			},
			"pw_who_tested_for_hiv_for_the_first_time_at_the_clinic": {
				"line_number": "5c",
				"sw": "Wajawazito Waliopima VVU kipimo cha kwanza kliniki:",
				"en": "PW who tested for HIV for the first time at the clinic",
				"field": {
					"name": ["hiv_pregnancy_clinic.tested_hiv_firstvisit", "anc_followup.tested_hiv_firstvisit", "anc_first_visit.tested_hiv_firstvisit"],
					"type": "count"
				}
			},
			"pw_who_tested_positive_by_the_first_test": {
				"line_number": "5d",
				"sw": "Wajawazito Waliokutwa na VVU (positive) kipimo cha kwanza:",
				"en": "PW who tested positive by the first test",
				"field": {
					"name": ["hiv_pregnancy_clinic.first_hiv_status", "anc_first_visit.first_hiv_status", "anc_followup.first_hiv_status"],
					"type": "count"
				}
			},
			"pw_below_25_years_who_tested_for_hiv_for_the_first_time_at_the_clinic": {
				"line_number": "5e",
				"sw": "Wajawazito waliopimwa VVU Kipimo cha kwanza chini ya Umri wa miaka 25",
				"en": " PW below 25 years who tested for HIV for the first time at the clinic",
				"field": {
					"name": [
						"patient.patient_age",
						"hiv_pregnancy_clinic.tested_hiv_firstvisit", "anc_first_visit.tested_hiv_firstvisit", "anc_followup.tested_hiv_firstvisit"
					],
					"type": "count",
					"operation": "patient.patient_age < 25"
				}
			},
			"pw_below_25_years_who_tested_positive_by_the_first_test": {
				"line_number": "5f",
				"sw": "Wajawazito Waliokutwa na VVU (positive) kipimo cha kwanza walio chini ya umri wa miaka 25:",
				"en": "PW below 25 years who tested positive by the first test",
				"field": {
					"name": [
						"patient.patient_age",
						"hiv_pregnancy_clinic.first_hiv_status", "anc_followup.first_hiv_status", "anc_first_visit.first_hiv_status"
					],
					"type": "count",
					"operation": "patient.patient_age < 25"
				}
			},
			"pw_who_were_counselled_after_testing_hiv": {
				"line_number": "5g",
				"sw": "Wajawazito Waliopata Ushauri baada ya kupima:",
				"en": "PW who were counselled after testing HIV",
				"field": {
					"name": ["hiv_pregnancy_clinic.counseled_hiv_prior_test", "anc_first_visit.counseled_hiv_prior_test", "anc_followup.counseled_hiv_prior_test"],
					"operation": "== false",
					"type": "count"
				}
			},
			"pw_who_tested_together_with_their_couple_together_at_the_clinic": {
				"line_number": "5h",
				"sw": "Wajawazito waliopimwa VVU na wenza wao (Couple) kwa pamoja katika kliniki ya wajawazito:",
				"en": "PW who tested together with their couple together at the clinic",
				"field": {
					"name": ["hiv_pregnancy_clinic.partner_hiv", "anc_followup.partner_hiv", "anc_first_visit.partner_hiv"],
					"type": "count"
				}
			},
			"pw_who_tested_hiv_by_the_second_test": {
				"line_number": "5i",
				"sw": "Wajawazito waliopima VVU kipimo cha pili:",
				"en": "PW who tested HIV by the second test",
				"field": {
					"name": ["hiv_pregnancy_clinic.second_hiv_test", "anc_first_visit.second_hiv_test", "anc_followup.second_hiv_test"],
					"type": "count"
				}
			},
			"pw_who_tested_positive_by_the_second_test": {
				"line_number": "5j",
				"sw": "Wajawazito waliokutwa na maambukizi ya VVU kipimo cha pili:",
				"en": "PW who tested positive by the second test",
				"field": {
					"name": ["hiv_pregnancy_clinic.second_hiv_test", "anc_first_visit.second_hiv_test", "anc_followup.second_hiv_test"],
					"type": "count"
				}
			},
			"partners_husbands_who_tested_for_hiv_at_the_clinic": {
				"line_number": "5k",
				"sw": "Wenza waliopima VVU Kliniki ya wajawazito:",
				"en": "Patners/husbands who tested for HIV at the clinic",
				"field": {
					"name": "/visit/hivCounselingMother/FIXME"
				}
			},
			"partners_husbands_who_tested_positive_at_the_clinic": {
				"line_number": "5l",
				"sw": "Wenza waliogundulika kuwa na maambukizi ya VVU katika kliniki va wajawazito:",
				"en": "Patners/husbands who tested positive at the clinic",
				"field": {
					"name": "/visit/hivCounselingMother/FIXME"
				}
			},
			"discordant_couples": {
				"line_number": "5m",
				"sw": "Wajawazito na wenza waliopata majibu tofauti (discordant) baada ya kupima VVU kliniki",
				"en": "Couples who have different HIV results after testing at the clinic(discordant couple)",
				"field": {
					"name": "/visit/hivCounselingMother/FIXME"
				}
			},
			"pw_who_received_pmtct_combination_drugs": {
				"line_number": "5n",
				"sw": "Wajawazito waliopewa dawa za Mchanganyiko za PMTCT:",
				"en": "PW who received PMTCT combination drugs:",
				"field": {
					"name": "/visit/hivCounselingMother/FIXME"
				}
			},
			"pw_who_are_using_art_drugs": {
				"line_number": "5o",
				"sw": "Wajawazito wanaotumia dawa za ART:",
				"en": "PW whi are using ART drugs",
				"field": {
					"name": "/visit/hivCounselingMother/FIXME"
				}
			},
			"pw_who_were_given_ctx": {
				"line_number": "5p",
				"sw": "Wajawazito Waliopewa CTX:",
				"en": "PW who were given CTX (Cotrimocxazole)",
				"field": {
					"name": "/visit/hivCounselingMother/FIXME"
				}
			},
			"pw_who_were_counselled_on_feeding_the_baby": {
				"line_number": "5q",
				"sw": "Waliopata ushauri iuu ya ulishaji wa mtoto:",
				"en": "PW who were counselled on feeding the baby",
				"field": {
					"name": "/visit/hivCounselingMother/FIXME"
				}
			},
			"malaria": {
				"line_number": "6",
				"sw": "Malaria:",
				"en": "Malaria"
			},
			"pw_given_a_voucher_for_hati_punguzo": {
				"line_number": "6a",
				"sw": "Waliopewa vocha ya hati punguzo:",
				"en": "PW given a voucher for Hati Punguzo (vouchr for free mosquito net)",
				"field": {
					"name": "/visit/anc_first_visit/malaria_net"
				}
			},
			"pw_tested_for_malaria": {
				"line_number": "6b",
				"sw": "Waliopima Malaria:",
				"en": "PW tested for malaria",
				"field": {
					"name": "/visit/anc_first_visit/malaria_test"
				}
			},
			"pw_tested_positive_for_malaria": {
				"line_number": "6c",
				"sw": "Waliopima Malaria positive:",
				"en": "PW tested positive for Malaria",
				"field": {
					"name": "/visit/anc_first_visit/malaria_test"
				}
			},
			"pw_given_ipt1_preventive_treatment": {
				"line_number": "6d",
				"sw": "Waliopewa IPT1:",
				"en": "PW given IPT1 (IPT--Intermittent Preventive Treatment)",
				"field": {
					"name": "/visit/anc_first_visit/malaria_ipt1"
				}
			},
			"pw_given_ipt2": {
				"line_number": "6e",
				"sw": "Waliopewa IPT2:",
				"en": "PW given IPT2",
				"field": {
					"name": "/visit/anc_first_visit/malaria_ipt2"
				}
			},
			"other_services": {
				"sw": "Huduma Nyingine:",
				"en": "Other services"
			},
			"pw_given_enough_iron_folic_tablets": {
				"line_number": "7",
				"sw": "Waliopewa Iron/Folic vidonge vya kutosha:",
				"en": "PW given enough Iron/Folic tablets",
				"field": {
					"name": "/visit/anc_first_visit/iron_tablets"
				}
			},
			"pw_given_antihelminths": {
				"line_number": "8",
				"sw": "Waliopewa Dawa za minyoo (Mebendazole / Albendazole):",
				"en": "PW given antihelminths (Mebendazole/Albendazole)",
				"field": {
					"name": "/visit/anc_first_visit/antihelminths"
				}
			},
			"pw_who_were_given_refferals": {
				"line_number": "9",
				"sw": "Waliopewa Rufaa wakati wa uiauzito:",
				"en": "PW who were given refferals",
				"field": {
					"name": "/visit/anc_first_visit/refferal"
				}
			},
			"pw_reffered_to_ctc": {
				"line_number": "10",
				"sw": "Waliopcwa Rufaa kwenda CTC:",
				"en": "PW reffered to CTC (CTC-care and treatment center)",
				"field": {
					"name": "/visit/anc_first_visit/referredCTC"
				}
			}
		},
		"definitions": {
			"range_age": {
				"below20": {
					"title": "Below 20 years old"
				},
				"above20": {
					"title": "Above 20 years old"
				},
				"total": {
					"title": "Total"
				}
			}
		}
	}
}