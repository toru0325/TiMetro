exports.MetroMatrixView = function(props) {
	props = props || {};

	var sv;

	var cellWidth = props.cellWidth || 120;
	var cellHeight = props.cellHeight || 120;
	var margin = props.margin || 8;
	var views = props.views || [];
	var col = props.column || 2;
	var row = Math.ceil(views.length / col);
	var delay = props.delay || 60;
	var width = props.width || 320;

	_init();

	//=== 拡張メソッドをextにつめこむ
	sv.ext = {
		flipOut : _flipOut,
		flipIn : _flipIn,
		flipIn2 : _flipIn2,
	};

	return sv;

	//

	//============== プライベートメソッド ==============
	//=== 初期化
	function _init() {
		sv = Ti.UI.createScrollView({
			width : width,
			contentWidth : width,
			contentHeight : 'auto',
			showVerticalScrollIndicator : true,
			showHorizontalScrollIndicator : false
		});

		//=== 各ViewのプロパティをFIXしてsvに挿入
		for(var i = 0; i < views.length; i++) {
			var v = views[i];
			var t = Ti.UI.create3DMatrix();
			//=== 奥行きを設定
			t.m34 = 1.0 / -400;
			v.width = cellWidth;
			v.height = cellHeight;
			v.left = margin + (cellWidth + margin) * (i % col);
			v.top = margin + (cellHeight + margin) * Math.floor(i / col);
			//=== タイルのアンカーポイントを設定
			v.anchorPoint = {
				x : -(cellWidth + margin) / cellWidth * (i % col),
				y : -Math.floor(i / col)
			};
			v.transform = t.rotate(-90, 0, 1, 0);
			//=== オリジナルのトランスフォームを保持
			v._t = t;
			sv.add(v);
		}

		//=== svのスクロール高を調整
		sv.contentHeight = (cellHeight + margin) * Math.floor(views.length / col) + margin;
	}

	//=== タイル退場アニメーション
	function _flipOut(activeIndex, cbFunc) {
		//=== activeIndexはクリックされた位置。このタイルだけ少し遅らせる
		activeIndex = (activeIndex !== null) ? activeIndex : views.length - 1;
		for(var i = 0; i < views.length; i++) {
			var v = views[i];
			var t1 = v._t.rotate(-90, 0, 1, 0);
			v.transform = v._t;
			if(i != activeIndex) {
				v.animate({
					delay : i * delay,
					duration : 200,
					transform : t1,
				});
			} else {
				v.animate({
					delay : (views.length + 1) * delay,
					duration : 200,
					transform : t1,
				}, function() {
					if(cbFunc)
						cbFunc();
				})
			}
		}
	}

	//=== タイル登場アニメーション（手前から登場）
	function _flipIn(cbFunc) {
		for(var i = 0; i < views.length; i++) {
			var v = views[i];
			var anim = {
				delay : (views.length - 1 - i) * delay,
				duration : 400,
				transform : v._t,
				curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT,
			};
			v.transform = v._t.rotate(-90, 0, 1, 0);
			if(i < views.length - 1) {
				v.animate(anim);
			} else {
				v.animate(anim, function() {
					if(cbFunc)
						cbFunc();
				});
			}
		}
	}

	//=== タイル登場アニメーション（奥から登場）
	function _flipIn2(cbFunc) {
		for(var i = 0; i < views.length; i++) {
			var v = views[i];
			var anim = {
				delay : (i + 1) * 10,
				duration : 500,
				transform : v._t,
				curve : Ti.UI.ANIMATION_CURVE_EASE_IN_OUT,
			};
			v.transform = v._t.rotate(90, 0, 1, 0);
			if(i < views.length - 1) {
				v.animate(anim);
			} else {
				v.animate(anim, function() {
					if(cbFunc)
						cbFunc();
				});
			}
		}
	}

};

exports.MetroWindow = function() {
	var w = Ti.UI.createWindow({
		anchorPoint : {
			//=== アンカーポイントを左端にセット
			x : 0,
			y : 0.5,
		}
	});

	//=== 拡張メソッドをextにつめこむ
	w.ext = {
		flipOut : _flipOut,
		flipIn : _flipIn,
		fadeOpen : _fadeOpen
	};

	return w;

	//

	//============== プライベートメソッド ==============
	//=== ウィンドウ退場アニメーション
	function _flipOut(cbFunc) {
		var t = Ti.UI.create3DMatrix();
		//=== 奥行きを設定
		t.m34 = -1 / 400;
		w.animate({
			duration : 300,
			opaque : true,
			opacity : 0.0,
			transform : t.rotate(90, 0, 1, 0)
		}, function() {
			if(cbFunc)
				cbFunc();
		});
	}

	//=== ウィンドウ登場アニメーション
	function _flipIn(cbFunc) {
		var t = Ti.UI.create3DMatrix();
		t.m34 = -1 / 400;
		w.transform = t.rotate(90, 0, 1, 0);
		w.opacity = 0.0;
		w.animate({
			duration : 300,
			opaque : true,
			opacity : 1.0,
			transform : t,
		}, function() {
			if(cbFunc)
				cbFunc();
		});
	}

	//=== フェードしながらウィンドウをopen
	function _fadeOpen() {
		w.opacity = 0;
		w.open();
		w.animate({
			duration : 300,
			opaque : true,
			opacity : 1.0,
		});
	}

};
