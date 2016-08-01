function PageView(PageDocument, PagePrefix)
{
	this.Document = PageDocument;
	this.Prefix = PagePrefix;


	//---------------------------------------------------------------------
	this.GetElement = function PageUI_GetElement(PageSelector)
	{
		var selector = PageSelector;
		if (this.Prefix)
		{
			selector = this.Prefix + selector;
		}
		var element = $(selector);
		return element;
	};


	//---------------------------------------------------------------------
	this.GetElementByID = function PageUI_GetElementByID(ElementID)
	{
		var id = ElementID;
		if (this.Prefix)
		{
			id = this.Prefix + id;
		}
		var element = this.Document.getElementById(id);
		return element;
	};


	//---------------------------------------------------------------------
	this.Initialize = function PageUI_Initialize()
	{
		
		// Main Menu
		this.MainMenuButton = this.GetElement("#main-menu-button");
		this.MainMenu_NewSession = this.GetElement("#game_new_session");
		this.MainMenu_ResetAccount = this.GetElement("#game_account_reset");
		this.MainMenu_Login = this.GetElement("#menu-login");
		
		// Account
		this.AccountDisplay = this.GetElement("#account_display");
		this.AccountEquity = this.GetElement("#account_equity");
		this.AccountBalance = this.GetElement("#account_balance");
		this.AccountMargin = this.GetElement("#margin_reserve");
		
		// Trading
		this.TradeDisplay = this.GetElement("#trade_display");
		this.TradeAveragePrice = this.GetElement("#average_price");
		this.TradeProfitPoints = this.GetElement("#profit_loss_points");
		this.TradeProfitDollars = this.GetElement("#profit_loss_dollars");

		this.TradeBuyButton = this.GetElement("#game_trade_buy");
		this.TradeSellButton = this.GetElement("#game_trade_sell");
		this.TradeFlattenButton = this.GetElement("#game_trade_flatten");
		
		// Game Clock
		this.ClockDisplay = this.GetElement("#clock_display");
		this.GameSpeedDisplay = this.GetElement("#game_speed");
		this.GameSpeedFasterButton = this.GetElement("#game_speed_faster");
		this.GameSpeedSlowerButton = this.GetElement("#game_speed_slower");
		
		// Debug Display
		this.FPS = this.GetElement("#FPS");
		
		return;
	};


	//---------------------------------------------------------------------
	this.Update = function PageUI_Update(PageState)
	{
		// Debug Display
		this.FPS.text( PageState.FPS.toFixed( 2 ) );
		
		return;
	};



}
