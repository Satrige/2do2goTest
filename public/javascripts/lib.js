'use strict';
$(document).ready(function() {
	$('.sort-form').on('submit', function(e) {
		e.preventDefault();

		var curForm = $(e.currentTarget),
			format = curForm.find('select[name=format]').val();

		var params = {
			url : curForm.find('input[name=url]').val(),
			field : curForm.find('select[name=field]').val() || 'created',
			order : curForm.find('select[name=order]').val() || 'ASC',
			format : format || 'sql'
		};

		if (format === 'csv') {
			params['csv-delimiter'] = curForm.find('input[name=csv-delimiter]').val();
		}
		else {
			params['table-name'] = curForm.find('input[name=sql-table-name]').val();
			params['fields'] = [];
			params['fields'].push(curForm.find('input[name=sql-id-name]').val());
			params['fields'].push(curForm.find('input[name=sql-date-name]').val());
			params['fields'].push(curForm.find('input[name=sql-rating-name]').val());
			params['fields'].push(curForm.find('input[name=sql-title-name]').val());
		}

		$.get(this.action, params, function(data, status) {
			if (status === 'success') {
				if (data.res === 'ok') {
					$('.output p').html(data.answ.replace(/\n/g, '<br>'));
				}
				else {
					$('.output p').text(data.descr);
				}
			}
			else {
				$('.output p').text('Smthing went wrong.');
			}
		})
	});

	$('.sort-form select[name=format]').on('change', function(e) {
		var selectedFormat = $(e.currentTarget).val();

		$('.sort-form .extend-params').slideUp(function() {
			$('.sort-form .' + selectedFormat + '-params').slideDown();
		});
	});

	$('.agr-form').on('submit', function(e) {
		e.preventDefault();
		var curForm = $(e.currentTarget),
			format = curForm.find('select[name=format]').val();

		var params = {
			url : curForm.find('input[name=url]').val(),
			field : curForm.find('select[name=field]').val(),
			order : curForm.find('select[name=order]').val(),
			format : format
		};

		if (format === 'csv') {
			params['csv-delimiter'] = curForm.find('input[name=csv-delimiter]').val();
		}
		else {
			params['table-name'] = curForm.find('input[name=sql-table-name]').val();
			params['fields'] = [];
			params['fields'].push(curForm.find('input[name=sql-domain-name]').val());
			params['fields'].push(curForm.find('input[name=sql-count-name]').val());
			params['fields'].push(curForm.find('input[name=sql-sum-name]').val());
		}

		$.get(this.action, params, function(data, status) {
			if (status === 'success') {
				if (data.res === 'ok') {
					$('.output p').html(data.answ.replace(/\n/g, '<br>'));
				}
				else {
					$('.output p').text(data.descr);
				}
			}
			else {
				$('.output p').text('Smthing went wrong.');
			}
		})
	});

	$('.agr-form select[name=format]').on('change', function(e) {
		var selectedFormat = $(e.currentTarget).val();

		$('.agr-form .extend-params').slideUp(function() {
			$('.agr-form .' + selectedFormat + '-params').slideDown();
		});
	});
});