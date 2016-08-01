/*
global ctk
global PageView
global ChartGame
global Game
*/

//--------------------------------------------------------------------------
//  DreamFactory 2.0 instance specific constants
//--------------------------------------------------------------------------

var INSTANCE_URL = 'https://df-agbowlin-01.enterprise.dreamfactory.com';
var APP_API_KEY = '48a384ea0243a54d236bbf76e412f647547da74c904287f29ab194155aab9c39';


//---------------------------------------------------------------------
function InitializeUI()
{
	var page_view = new PageView(document);
	page_view.Initialize();

	page_view.ClockDisplay.text('Initializing ...');

	var chart_element = document.getElementById("chart_canvas");
	Game = new ChartGame(chart_element, UpdateUI);
	Game.PageView = page_view;
	Game.ResetGame();

	Game.Instrument.Symbol = 'ES';
	Game.Instrument.Name = 'S&P 500 E-Mini';
	Game.Instrument.Contract = '';
	Game.Instrument.DateText = '2012-12-12';
	Game.Instrument.TickSize = 0.25;
	Game.Instrument.TicksPerPoint = 4;
	Game.Instrument.PointValue = 50.00;
	Game.Instrument.Margin = 500.00;
	Game.Instrument.TradeFee = 0.00;

	var account_equity = GetCookie('liquicode.simtrader.AccountEquity');

	if (isNaN(account_equity) || (account_equity === ''))
	{
		Game.Account.AccountBalance = 2000.00;
	}
	else
	{
		Game.Account.AccountBalance = parseFloat(account_equity);
	}
	Game.Account.MarginReserve = 0.00;
	Game.Account.PositionSize = 0;
	Game.Account.AveragePrice = 0.00;

	//------------------------------------------
	//	Main Menu
	//------------------------------------------

	Game.PageView.MainMenuButton.click(function()
	{
		$('#main-menu-modal').modal('show');
	});

	Game.PageView.MainMenu_NewSession.click(function()
	{
		// Game.ResetGame();
		location.reload();
	});
	Game.PageView.MainMenu_ResetAccount.click(function()
	{
		Game.StopGame();
		SetCookie('liquicode.simtrader.AccountEquity', '', 0);
		location.reload();
	});

	Game.PageView.MainMenu_Login.click(function()
	{
		$('#login-modal').modal('show');
	});

	$('#login-button').on('click', function()
	{
		var email = $('#login-email').val();
		var password = $('#login-password').val();

		$.api.login(email, password, loginHandle);
	});

	$('#login-cancel-button').on('click', function()
	{
		$('#login-modal').modal('hide');
	});

	//------------------------------------------
	//	Trading
	//------------------------------------------

	Game.PageView.TradeDisplay.click(function()
	{
		$('#trade_modal').modal('show');
	});

	// Bind to button click events.
	Game.PageView.TradeBuyButton.click(function()
	{
		if (Game.GamePaused === false)
		{
			Game.Buy(1);
			UpdateUI();
		}
	});
	Game.PageView.TradeSellButton.click(function()
	{
		if (Game.GamePaused === false)
		{
			Game.Sell(1);
			UpdateUI();
		}
	});
	Game.PageView.TradeFlattenButton.click(function()
	{
		if (Game.GamePaused === false)
		{
			Game.Flat();
			UpdateUI();
		}
	});
	
	//------------------------------------------
	//	Game Clock
	//------------------------------------------

	Game.PageView.ClockDisplay.click(function()
	{
		if (Game.GameStarted === false)
		{
			Game.StartGame();
		}
		else if (Game.GamePaused === true)
		{
			Game.ResumeGame();
		}
		else
		{
			Game.PauseGame();
		}
		// $('#clock_modal').modal('show');
	});

	Game.PageView.GameSpeedSlowerButton.click(function()
	{
		if (Game.GameSpeed > 0.25)
		{
			Game.GameSpeed /= 2;
			UpdateUI();
		}
	});
	Game.PageView.GameSpeedFasterButton.click(function()
	{
		if (Game.GameSpeed < 512)
		{
			Game.GameSpeed *= 2;
			UpdateUI();
		}
	});

	//------------------------------------------
	//	Resizing
	//------------------------------------------

	// Bind to window resize event.
	$(window).resize(ResizeUI);

	// Resize the UI to initialize the display.
	ResizeUI();
	// window.setTimeout(ResizeUI, 1);

	// Fetch the tick data from the server.
	// Game.Instrument.LoadTickData();
	window.setTimeout(Game.Instrument.LoadTickData, 250);

	// Return, OK
	return;
}


//---------------------------------------------------------------------
function ResizeUI()
{
	var canvas_width = (Game.Canvas.parentNode.clientWidth - Game.Canvas.offsetLeft);
	var canvas_height = (Game.Canvas.parentNode.clientHeight - Game.Canvas.offsetTop);
	canvas_width -= 10;
	canvas_height -= 10;

	Game.Canvas.width = canvas_width;
	Game.Canvas.height = canvas_height;

	// Update the display.
	//UpdateUI();
	//global.view.update();
	Game.Update();

	// Return, OK
	return;
}


//---------------------------------------------------------------------
function UpdateUI()
{
	Game.PageView.Update(Game);

	if (Game.Instrument.TicksLoaded === false)
	{
		Game.PageView.ClockDisplay.text('Loading ...');
		return;
	}

	if (Game.GameStarted)
	{
		var text = '';
		if (Game.GamePaused)
		{
			text += '* ';
		}
		text += Game.GameTime.toLocaleTimeString();
		Game.PageView.ClockDisplay.text(text);
	}
	else
	{
		Game.PageView.ClockDisplay.text('Ready!');
	}
	Game.PageView.GameSpeedDisplay.text(Game.GameSpeed.toFixed(2) + 'X');

	var profit_loss_points = 0;
	var profit_loss_dollars = 0;
	var account_equity = Game.Account.AccountBalance;

	// Trade Controls
	if (Game.Account.PositionSize === 0)
	{
		Game.PageView.TradeDisplay.text('no position');
		Game.PageView.TradeProfitPoints.text('');
		Game.PageView.TradeProfitDollars.text('');
	}
	else
	{
		profit_loss_points = Math.sign(Game.Account.PositionSize) * (Game.Bars.Last - Game.Account.AveragePrice);
		profit_loss_dollars = Math.abs(Game.Account.PositionSize) * (Game.Instrument.PointValue * profit_loss_points);
		account_equity = Game.Account.AccountBalance + profit_loss_dollars;

		if (Game.Account.PositionSize > 0)
		{
			Game.PageView.TradeDisplay.text('Long ' + Math.abs(Game.Account.PositionSize));
		}
		else
		{
			Game.PageView.TradeDisplay.text('Short ' + Math.abs(Game.Account.PositionSize));
		}

		if (profit_loss_points === 0)
		{
			Game.PageView.TradeProfitPoints.css('color', 'yellow');
			Game.PageView.TradeProfitDollars.css('color', 'yellow');
		}
		else if (profit_loss_points > 0)
		{
			Game.PageView.TradeProfitPoints.css('color', 'green');
			Game.PageView.TradeProfitDollars.css('color', 'green');
		}
		else if (profit_loss_points < 0)
		{
			Game.PageView.TradeProfitPoints.css('color', 'red');
			Game.PageView.TradeProfitDollars.css('color', 'red');
		}

		Game.PageView.TradeProfitPoints.text(profit_loss_points.toFixed(2) + ' points');
		Game.PageView.TradeProfitDollars.text(profit_loss_dollars.toFixed(2));
	}
	Game.PageView.TradeAveragePrice.text(Game.Account.AveragePrice.toFixed(2));

	// Finance Controls
	var account_equity_text = '$ ' + account_equity.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	Game.PageView.AccountDisplay.text(account_equity_text);
	Game.PageView.AccountEquity.text(account_equity_text);
	Game.PageView.AccountBalance.text(Game.Account.AccountBalance.toFixed(2));
	Game.PageView.AccountMargin.text(Game.Account.MarginReserve.toFixed(2));

	SetCookie('liquicode.simtrader.AccountEquity', account_equity.toFixed(2), 0);

	// Return, OK
	return;
}


//--------------------------------------------------------------------------
//  Login Modal
//--------------------------------------------------------------------------

var loginHandle = function(response)
{

	if (response.hasOwnProperty('session_token'))
	{
		setToken('token', response.session_token);
		MessageBox('SimTrader', 'Welcome, ' + response.name + '!');
		// $.route('groups');
		$('#login-modal').modal('hide');
	}
	else
	{
		var msgObj = {};
		msgObj = parseResponse(response);
		if (msgObj)
		{
			MessageBox(msgObj.code, msgObj.message, msgObj.error);
		}
	}
};


//--------------------------------------------------------------------------
//  Register
//--------------------------------------------------------------------------

$('#signup-button').on('click', function()
{
	var firstname = $('#register_firstname').val();
	var lastname = $('#register_lastname').val();
	var email = $('#register_email').val();
	var password = $('#register_password').val();

	$.api.register(firstname, lastname, email, password, function(response)
	{
		if (response.hasOwnProperty('session_token'))
		{
			setToken('token', response.session_token);
			// $.route('groups');
		}
		else
		{
			var msgObj = {};
			msgObj = parseResponse(response);
			if (msgObj)
			{
				MessageBox(msgObj.code, msgObj.message, msgObj.error);
			}
		}
	});
});

