// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({
	title : 'Tab 1',
	backgroundColor : '#000',
	tabBarHidden : true,
	navBarHidden : true
});
var tab1 = Titanium.UI.createTab({
	icon : 'KS_nav_views.png',
	title : 'Tab 1',
	window : win1
});

//=== MetroUI.jsを読み込む
var MetroUI = require("MetroUI");

//=== Homeウィンドウをセットアップ
_setupHomeWin(win1);

//
//  add tabs
//
tabGroup.addTab(tab1);

// open tab group
tabGroup.open();

//

//

//

//=== Homeウィンドウをセットアップ
function _setupHomeWin(w) {
	//=== 左右エリアを含むラップビューを作成
	var wrapV = Ti.UI.createView({
		width : 500,
		left : 0,
	});
	w.add(wrapV);

	//=== 各タイルビューを用意
	var views = [];
	for(var i = 0; i < 10; i++) {
		var v = Ti.UI.createView({
			backgroundImage : "src/home_dummy_0" + ((i % 7) + 1) + ".png", //=== ダミー画像を使用
		});
		v.addEventListener("click", _clickCell);
		views.push(v);
	}

	//=== 用意したタイルビューリストからMetroMatrixViewを生成
	var mv = new MetroUI.MetroMatrixView({
		views : views,
		cellWidth : 114,
		cellHeight : 114,
		margin : 10,
		column : 2,
		width : 260,
	});
	mv.left = 0;
	//=== スクロールバーを非表示
	mv.showVerticalScrollIndicator = false;
	wrapV.add(mv);

	//=== 右上の「->」ボタン
	var bt = Ti.UI.createView({
		width : 30,
		height : 30,
		top : 10,
		left : 320 - 20 - 30,
		opacity : 0.0,
		backgroundImage : "src/home_next.png",
		_isBack : false,
	});
	bt.addEventListener("click", function() {
		//=== クリックでラップビューを左右に移動
		wrapV.animate({
			duration : 300,
			transform : Ti.UI.create2DMatrix().translate(bt._isBack ? 0 : -260, 0),
		});
		_switchButton();
	});
	wrapV.add(bt);

	//=== 右エリアのメニューリストをTableViewで生成
	var data = [];
	for(var i = 0; i < 20; i++) {
		data.push({
			leftImage : "src/menu_dummy_0" + ((i % 5) + 1) + ".png", //=== ダミー画像を使用
		});
	}
	var tv = Ti.UI.createTableView({
		width : 260,
		left : 320,
		top : 10,
		backgroundColor : "black",
		selectionStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
		rowHeight : 44,
		data : data
	});
	wrapV.add(tv);

	//=== ウィンドウがアクティブになったら自動でFlipInするように設定
	w.addEventListener("focus", function() {
		mv.ext.flipIn();
		_showButton();
	});
	//

	//================ プライベートメソッド ================
	//=== 「->」ボタンの方向（画像）を切り替え
	function _switchButton() {
		bt.backgroundImage = !bt._isBack ? "src/home_back.png" : "src/home_next.png";
		bt._isBack = !bt._isBack;
	}

	//===  「->」ボタンをフェードアウト
	function _hideButton() {
		bt.animate({
			duration : 600,
			transform : Ti.UI.create2DMatrix().translate(-30, 0),
			opaque : true,
			opacity : 0.0,
		});
	}

	//=== 「->」ボタンをフェードイン
	function _showButton() {
		bt.transform = Ti.UI.create2DMatrix().translate(-30, 0);
		bt.animate({
			duration : 600,
			transform : Ti.UI.create2DMatrix(),
			opaque : true,
			opacity : 1.0,
		});
	}

	//=== タイルクリックイベント
	function _clickCell(e) {
		var i = views.indexOf(e.source);
		//=== ボタンを隠し、MetroMatrixViewをFlipOut後、サブウィンドウを表示する
		_hideButton();
		mv.ext.flipOut(i, function() {
			w.hide();
			_openSubWin(function() {
				w.show();
			});
		});
	}

};

//=== サブウィンドウ（Outlook画面）を生成（クローズ時にコールバック）
function _openSubWin(cbFunc) {

	//=== MetroWindowとして生成
	var w = MetroUI.MetroWindow();
	w.backgroundColor = "white";

	//=== ヘッダ部分のデザイン画像を挿入
	w.add(Ti.UI.createView({
		height : 90,
		top : 0,
		backgroundImage : "src/inbox_head.png"
	}));

	//=== MetroMatrixViewに入れるViewを用意
	var views = [];
	for(var i = 0; i < 15; i++) {
		views.push(Ti.UI.createView({
			backgroundImage : "src/inbox_dummy_0" + ((i % 3) + 1) + ".png" //=== ダミー画像を使用
		}));
	}

	//=== MetroMatrixViewを生成
	var mv = new MetroUI.MetroMatrixView({
		views : views,
		cellWidth : 320,
		cellHeight : 75,
		margin : 2,
		column : 1,
	});
	mv.top = 100;
	w.add(mv);

	//=== クローズボタンを追加
	var bt = Ti.UI.createView({
		width : 30,
		height : 30,
		top : 10,
		right : 10,
		backgroundImage : "src/inbox_back.png",
	});
	bt.addEventListener("click", function() {
		//=== ウィンドウをFripOutアニメーション後にクローズ
		w.ext.flipOut(function() {
			w.close();
			cbFunc();
		});
	});
	w.add(bt);

	//=== フォーカス時にMetroMatrixViewがFlipIn2アニメーションするようにセット
	w.addEventListener("focus", function() {
		mv.ext.flipIn2();
	});
	//=== ウィンドウをフェードイン
	w.ext.fadeOpen();
}