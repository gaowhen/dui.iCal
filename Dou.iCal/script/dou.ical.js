/** 
 * Author: Miko Gao gaowhen.com@gmail.com
 * Todo: 
 */

var dou = window.dou || {};

dou.log = function(obj) {
	if (typeof(console) != 'undefined' && typeof(console.log) == 'function') {
		console.log(obj);
	}
};

dou.ical = (function() {
	// 判断是否是函数
	// from John Resig
	function _isFunction(fn) {
		return !! fn && ! fn.nodeName && fn.constructor != String && fn.constructor != RegExp && fn.constructor != Array && /function/i.test(fn + "");
	}

	// 补全
	function _zeroize(data) {
		var _data = parseInt(data, 10);
		return _data > 9 ? _data: '0' + _data;
	}

	// 获取每月第一天在星期几
	function _getFirstDay(year, month) {
		var firstDay = new Date(year, month - 1, 1);
		return firstDay.getDay();
	}

	// 获取当前月总共有多少天
	function _getMonthLength(year, month) {
		var nextMonth = new Date(year, month, 0);
		return nextMonth.getDate();
	}

	// 拼装 days 数组
	function _makeDaysArray(year, month) {
		var days = [],
		firstDay = _getFirstDay(year, month),
		monthLength = _getMonthLength(year, month),
		// 一个日历视图由三个月数据构成
		// 如果当月的第一天是周五或者周六
		// 则日历视图有42天
		// 否则日历视图有35天
		// 单从当月第一天是周五、周六来判断
		// 是多么简单粗暴的弱智做法啊
		// thisMonthLength = firstDay === 5 || firstDay === 6 ? 42: 35,
		// 日历第一行中，当月的日期所占的天数
		firstRowDays = firstDay === 7 ? 7: 7-firstDay,
		daysLeft = monthLength - firstRowDays,
		calViewLength =  (Math.ceil(daysLeft / 7) + 1) * 7,
		prevMonthLength = _getMonthLength(year, month - 1);

		// 前一个月
		for (var i = firstDay - 1; i >= 0; i--) {
			days.push(prevMonthLength - i);
		};
		// 当前月
		for (var i = 1; i <= monthLength; i++) {
			days.push(i);
		}
		// 下一个月
		for (var i = 1; i <= calViewLength - monthLength - firstDay; i++) {
			days.push(i);
		}

		return days;
	}

	// 前、后月
	$.fn.anotherMonth = function(data) {
		var $this = $(this);
		$this.bind('click', function() {
			var date = $(this).data('date');
			var option = {
				type: data.type,
				ele: data.ele,
				context: data.context,
				date: date
			};

			_initCal(option);
			//_init_by_schedule(option);
			return false;
		});
	};

	// 初始化日历结构
	function _initCal(option) {

		var _now = new Date(),
		now = _now.format('yyyy-mm-dd'),

		defaults = {
			type: 'normal',
			// popup
			ele: '',
			// 触发日历的元素(jquery 对象)
			context: 'dou-ical-normal',
			date: now,
			callback: '',
			position: 'bottom' // top right bottom left
		},

		opt = $.extend(defaults, option),

		year = prevYear = nextYear = opt.date.split('-')[0],
		month = opt.date.split('-')[1],
		monthLength = _getMonthLength(year, month),
		prevMonth = parseInt(month, 10) - 1,
		nextMonth = parseInt(month, 10) + 1;

		if (prevMonth < 1) {
			prevYear = (parseInt(year) - 1) + '';
			prevMonth = '12';
		} else if (prevMonth < 10) {
			prevMonth = '0' + prevMonth;
		}

		if (nextMonth > 12) {
			nextYear = (parseInt(year) + 1) + '';
			nextMonth = '01';
		} else if (nextMonth < 10) {
			nextMonth = '0' + nextMonth;
		}

		var prev = prevYear + '-' + prevMonth + '-01';
		var next = nextYear + '-' + nextMonth + '-01';

		var days = _makeDaysArray(year, month);

		var data = {
			type: opt.type,
			ele: opt.ele,
			context: opt.context,
			month: month,
			year: year,
			days: days,
			callback: opt.callback
		};

		if ($('#' + opt.context).length) {
			$('#' + opt.context).remove();
		}

		switch (opt.type) {
			// popup
		case 'popup':

			$('#dou-ical-templ').tmpl(data).appendTo('body').show();

			var $iCal = $('#' + opt.context),
			left = _left = data.ele.offset().left,
			top = _top = data.ele.offset().top,
			_width = data.ele.width(),
			_height = data.ele.height();

			switch (opt.position) {
			case 'top':
				top = _top - _height - 5;
				break;
			case 'right':
				left = _left + width + 5;
				break;
			case 'left':
				left = _left - width - 5;
				break;
			default:
				// bottom
				top = _top + _height + 5;
			}

			$iCal.css({
				'left': left,
				'top': top
			});

			$(document).unbind('click.closeiCal').bind('click.closeiCal', function(e) {
				var $this = $(e.target);
				var isCal = $this.parents('div.dou-ical').length;

				if (!isCal) {
					$iCal.remove();
				}
			});

			break;
			// normal
		default:
			$('#dou-ical-templ').tmpl(data).appendTo(opt.ele).show();
			var $iCal = $('#' + opt.context);
		}

		$iCal.find('a.dou-btn-prev').data('date', prev);
		$iCal.find('a.dou-btn-next').data('date', next);
		$iCal.find('div.dou-ical-title').data('date', now);
		$iCal.find('div.dou-ical-hd a').anotherMonth(data);

		var _first = $.inArray(1, days),
		_last = _first + monthLength - 1;

		$.each($iCal.find('td'), function(i, v) {
			var $this = $(this);
			if (i < _first) {
				$this.data('date', year + '' + _zeroize(parseInt(month) - 1) + '' + _zeroize($this.text()));
				$this.addClass('other-month');
			} else if (i > _last) {
				$this.data('date', year + '' + _zeroize(parseInt(month, 10) + 1) + '' + _zeroize($this.text()));
				$this.addClass('other-month');
			} else {
				$this.data('date', year + '' + _zeroize(month) + '' + _zeroize($this.text()));
				if ($this.data('date') === now.replace(/-/g, '')) {
					$this.addClass('today');
				}
			}
		});

		// 执行用户自定义的函数
		if (_isFunction(opt.callback)) {
			opt.callback();
		}

	}

	return {
		init: function(opt) {
			// TODO
			// 区分 normal 和 popup
			// 执行用户自定义函数
			// 例如，根据影讯初始化日历
			_initCal(opt);
			//_init_by_schedule(opt);
		}
	};
})();

