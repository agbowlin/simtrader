function AccountManager()
{

	this.AccountBalance = 0;
	this.MarginReserve = 0;
	this.PositionSize = 0;
	this.AveragePrice = 0;


	//--------------------------------------------------------------------
	this.Clone = function()
	{
		var that = new AccountManager();
		that.AccountBalance = this.AccountBalance;
		that.MarginReserve = this.MarginReserve;
		that.PositionSize = this.PositionSize;
		that.AveragePrice = this.AveragePrice;
		return that;
	};


	//--------------------------------------------------------------------
	this.ProfitLossPoints = function(Price)
	{
		if (this.PositionSize === 0)
		{
			return 0.0;
		}
		return (Price - this.AveragePrice);
	};


	//--------------------------------------------------------------------
	this.ProfitLossTicks = function(Instrument, Price)
	{
		var points = this.ProfitLossPoints(Price);
		if (points === 0.0)
		{
			return 0.0;
		}
		return (points / Instrument.TickSize);
	};


	//--------------------------------------------------------------------
	this.ProfitLossDollars = function(Instrument, Price)
	{
		var points = this.ProfitLossPoints(Price);
		if (points === 0.0)
		{
			return 0.0;
		}
		return (this.PositionSize * (Instrument.PointValue * points));
	};


	//--------------------------------------------------------------------
	this.AsIfExecuteTrade = function(Instrument, TradeSize, Price)
	{
		var account = this.Clone();
		account.ExecuteTrade(Instrument, TradeSize, Price);
		return account;
	};


	//--------------------------------------------------------------------
	this.ExecuteTrade = function(Instrument, TradeSize, Price)
	{
		//		float position_value = (this.PositionSize * this.AveragePrice);
		//		float original_pl = this.ProfitLossDollars( Instrument, Price );
		
		var remaining_trade_size = 0;
		if ((this.PositionSize >= 0) && (TradeSize > 0))
		{
			this.EnterLong(Instrument, TradeSize, Price);
		}
		else if ((this.PositionSize <= 0) && (TradeSize < 0))
		{
			this.EnterShort(Instrument, -TradeSize, Price);
		}
		else if ((this.PositionSize >= 0) && (TradeSize < 0))
		{
			// Liquidate long positions.
			if ((0 - TradeSize) > this.PositionSize)
			{
				remaining_trade_size = (this.PositionSize + TradeSize);
				TradeSize = (0 - this.PositionSize);
			}
			this.ExitLong(Instrument, -TradeSize, Price);
		}
		else if ((this.PositionSize <= 0) && (TradeSize > 0))
		{
			// Liquidate short positions.
			if (TradeSize > (0 - this.PositionSize))
			{
				remaining_trade_size = (this.PositionSize + TradeSize);
				TradeSize = (0 - this.PositionSize);
			}
			this.ExitShort(Instrument, TradeSize, Price);
		}

		// Process any remaning trades.
		if (remaining_trade_size !== 0)
		{
			this.ExecuteTrade(Instrument, remaining_trade_size, Price);
		}

		return;
	};


	//--------------------------------------------------------------------
	this.EnterLong = function(Instrument, TradeSize, Price)
	{
		var new_reserve = this.MarginReserve + (TradeSize * Instrument.Margin);
		if( new_reserve > this.AccountBalance )
		{
			return;
		}
		
		var position_value = (this.PositionSize * this.AveragePrice);
		position_value += (TradeSize * Price);
		this.PositionSize += TradeSize;
		this.AccountBalance -= (TradeSize * Instrument.TradeFee);
		this.MarginReserve += (TradeSize * Instrument.Margin);
		if (this.PositionSize === 0)
		{
			this.AveragePrice = 0.0;
		}
		else
		{
			this.AveragePrice = Math.abs(position_value / this.PositionSize);
		}
		return;
	};


	//--------------------------------------------------------------------
	this.ExitLong = function(Instrument, TradeSize, Price)
	{
		var original_pl = this.ProfitLossDollars(Instrument, Price);
		var position_value = (this.PositionSize * Price);
		position_value -= (TradeSize * this.AveragePrice);
		this.PositionSize -= TradeSize;
		this.AccountBalance += (original_pl - this.ProfitLossDollars(Instrument, Price));
		this.MarginReserve -= (TradeSize * Instrument.Margin);
		if (this.PositionSize === 0)
		{
			this.AveragePrice = 0.0;
		}
		return;
	};


	//--------------------------------------------------------------------
	this.EnterShort = function(Instrument, TradeSize, Price)
	{
		var new_reserve = this.MarginReserve + (TradeSize * Instrument.Margin);
		if( new_reserve > this.AccountBalance )
		{
			return;
		}
		
		var position_value = (this.PositionSize * this.AveragePrice);
		position_value -= (TradeSize * Price);
		this.PositionSize -= TradeSize;
		this.AccountBalance += (TradeSize * Instrument.TradeFee);
		this.MarginReserve += (TradeSize * Instrument.Margin);
		if (this.PositionSize === 0)
		{
			this.AveragePrice = 0.0;
		}
		else
		{
			this.AveragePrice = Math.abs(position_value / this.PositionSize);
		}
		return;
	};


	//--------------------------------------------------------------------
	this.ExitShort = function(Instrument, TradeSize, Price)
	{
		var original_pl = this.ProfitLossDollars(Instrument, Price);
		var position_value = (this.PositionSize * this.AveragePrice);
		position_value -= (TradeSize * Price);
		this.PositionSize += TradeSize;
		this.AccountBalance += (original_pl - this.ProfitLossDollars(Instrument, Price));
		this.MarginReserve -= (TradeSize * Instrument.Margin);
		if (this.PositionSize === 0)
		{
			this.AveragePrice = 0.0;
		}
		return;
	};

	return;
}
