'use strict';
$(document).ready(function() {

	var curType = $('.main-form select[name=op]').val(),
		selectedFormat = $('.main-form select[name=format]').val();

	$('.main-form').on('submit', function(e) {
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
			if (curType === 'agr') {
				params['table-name'] = curForm.find('.sql-agr-params input[name=sql-table-name]').val() || 'posts';
				params['fields'] = [];
				params['fields'].push(curForm.find('.sql-agr-params input[name=sql-domain-name]').val()) || 'domain';
				params['fields'].push(curForm.find('.sql-agr-params input[name=sql-count-name]').val()) || 'count';
				params['fields'].push(curForm.find('.sql-agr-params input[name=sql-sum-name]').val()) || 'sum';
			}
			else {
				params['table-name'] = curForm.find('input[name=sql-table-name]').val() || 'posts';
				params['fields'] = [];
				params['fields'].push(curForm.find('.sql-sort-params input[name=sql-id-name]').val()) || 'id';
				params['fields'].push(curForm.find('.sql-sort-params input[name=sql-date-name]').val()) || 'created';
				params['fields'].push(curForm.find('.sql-sort-params input[name=sql-rating-name]').val()) || 'score';
				params['fields'].push(curForm.find('.sql-sort-params input[name=sql-title-name]').val()) || 'title';
			}
		}

		$.get('/api/' + curType, params, function(data, status) {
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

	$('.main-form select[name=op]').on('change', function(e) {
		curType = $(e.currentTarget).val();
		if (curType == 'sort') {
			$('.main-form select[name=field]').slideDown();
		}
		else {
			$('.main-form select[name=field]').slideUp();
		}

		if (selectedFormat === 'sql') {
			$('.main-form .extend-params').slideUp();
			$('.main-form .' + selectedFormat + '-' + curType + '-params').slideDown();
		}
	});

	$('.main-form select[name=format]').on('change', function(e) {
		selectedFormat = $(e.currentTarget).val();
		$('.main-form .extend-params').slideUp();
		if (selectedFormat === 'sql') {
			$('.main-form .' + selectedFormat + '-' + curType + '-params').slideDown();
		}
		else {
			$('.main-form .' + selectedFormat + '-params').slideDown();
		}
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
		});
	});

	$('.child-form').on('submit', function(e) {
		e.preventDefault();
		var curForm = $(e.currentTarget);

		$.get(this.action, $(this).serialize(), function(data, status) {
			if (status === 'success') {
				if (data.res === 'ok') {
					$('.output p').html(JSON.stringify(data.answ, null, 4).replace(/\n/g, '<br>').replace(/\ /g, '&nbsp'));
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
	
});