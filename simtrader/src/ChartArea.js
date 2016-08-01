/*
global ctk
global ctk.AreaMap
*/


function ChartArea()
{
	this.Map = new ctk.AreaMap();
	this.BarWidth = 7;
	this.BarSpacing = 3;

	this.AxisStyle = new ctk.Style();
	this.AxisStyle.StrokeStyle = 'gray';
	this.AxisStyle.FillStyle = '#0A0000';
	this.AxisWidth = 100;
	this.AxisLabelInterval = 1.00;
	this.AxisLabelMargin = 10;
	this.AxisLabelDecimalPlaces = 0;


	//---------------------------------------------------------------------
	this.DrawBackground = function DrawBackground(Context)
	{
		var chart_border = new ctk.Border();

		chart_border.ClientStyle = this.AxisStyle;

		chart_border.SetSize(this.Map.TargetArea.width() - this.AxisWidth, this.Map.TargetArea.height());
		chart_border.Render(Context, this.Map.TargetArea.x0, this.Map.TargetArea.y0);

		return;
	}


	//---------------------------------------------------------------------
	this.DrawAxisY = function DrawAxisY(Context, High, Low)
	{
		var text_style = new ctk.Style();
		text_style.Font = '18px Roboto';
		text_style.FillStyle = 'white';
		text_style.StrokeStyle = 'white';

		var line_style = new ctk.Style();
		line_style.LineWidth = 1;
		line_style.StrokeStyle = 'gray';

		var x0 = this.Map.TargetArea.x0;
		var x1 = this.Map.TargetArea.x1;
		x1 -= this.AxisWidth;
		x1 += this.AxisLabelMargin;
		var low = Math.floor(Low);
		var high = 0;

		// Draw Y Axis Labels
		high = Math.ceil(High) + 1;
		while (high >= low)
		{
			var y = this.Map.MapY(high);
			ctk.DrawTextStyle(Context, high, x1, y + 8, text_style);
			high -= 1;
		}

		// Draw Y Axis Lines
		high = Math.ceil(High) + 1;
		while (high >= low)
		{
			var y = this.Map.MapY(high);
			ctk.DrawDashedLineStyle(Context, x0, y, x1 - this.AxisLabelMargin, y, 5, line_style);
			high -= 1;
		}

		return;
	};


	//---------------------------------------------------------------------
	this.DrawAxisYMarker = function DrawAxisYMarker(Context, Value, Text, Font, FillStyle, LineWidth, StrokeStyle)
	{
		var item = new ctk.Item();
		item.Text = Text; // Value.toFixed(this.AxisLabelDecimalPlaces);
		//if( Text ) { item.Text += "\n" + Text; }

		// Setup the text style.
		item.TextStyle = new ctk.Style();
		if (Font)
		{
			item.TextStyle.Font = Font;
		}
		if (FillStyle)
		{
			item.TextStyle.FillStyle = FillStyle;
		}
		if (LineWidth)
		{
			item.TextStyle.LineWidth = LineWidth;
		}
		if (StrokeStyle)
		{
			item.TextStyle.StrokeStyle = StrokeStyle;
		}

		// Setup the border.
		item.Border = new ctk.Border();
		item.Border.BorderStyle = new ctk.Style();
		item.Border.BorderStyle.FillStyle = 'black';
		item.Border.BorderStyle.LineWidth = 3;
		item.Border.BorderStyle.StrokeStyle = 'gray';
		item.Border.BorderStyle.ShadowColor = 'gray';
		item.Border.BorderStyle.ShadowBlur = 20;
		item.Border.BorderStyle.ShadowOffsetX = 0;
		item.Border.BorderStyle.ShadowOffsetY = 0;
		item.Border.BorderDepth = 3;
		item.Border.ContentPadding = 3;
		item.ClientStyle = item.TextStyle;

		// Measure the text rectangle.
		item.FitText(Context, this.AxisWidth - this.AxisLabelMargin, 500);

		// Position the text.
		var x = this.Map.TargetArea.x1;
		x -= this.AxisWidth;
		x += this.AxisLabelMargin;
		var y = this.Map.MapY(Value);
		y -= (item.Border.BorderRect.h / 2)
		
		// Draw the text.
		item.Render(Context, x, y);

		// Draw the marker.
		item.Text = '';
		item.Border.BorderStyle.FillStyle = 'gray';
		item.Border.BorderStyle.LineWidth = 1;
		item.Border.BorderStyle.StrokeStyle = 'yellow';
		item.Border.BorderStyle.ShadowColor = 'gray';
		item.Border.BorderStyle.ShadowBlur = 20;
		item.Border.BorderStyle.ShadowOffsetX = 0;
		item.Border.BorderStyle.ShadowOffsetY = 0;
		item.Border.BorderDepth = 1;
		item.Border.ContentPadding = 0;
		
		item.Border.SetContentSize( 80, 6 );
		
		x = this.Map.TargetArea.x1;
		x -= this.AxisWidth;
		x -= item.Border.BorderRect.w;
		x -= 10;
		y = this.Map.MapY(Value);
		y -= (item.Border.BorderRect.h / 2)
		item.Render(Context, x, y);

		return;
	}


	//---------------------------------------------------------------------
	this.DrawTrade = function DrawTrade(Context, Game, Font, FillStyle, LineWidth, StrokeStyle)
	{
		if (Game.Account.PositionSize === 0)
		{
			return;
		}

		var profit_loss_points = Math.sign(Game.Account.PositionSize) * (Game.Bars.Last - Game.Account.AveragePrice);
		var profit_loss_dollars = Math.abs(Game.Account.PositionSize) * (Game.Instrument.PointValue * profit_loss_points);

		var item = new ctk.Item();
		item.Text = profit_loss_dollars.toFixed(2) + ' $';
		// item.Text += Game.Account.AveragePrice.toFixed(2);
		// item.Text += "<br/>" + profit_loss_points.toFixed(2);
		// item.Text += "<br/>" + profit_loss_dollars.toFixed(2);

		item.TextStyle = new ctk.Style();
		if (Font)
		{
			item.TextStyle.Font = Font;
		}
		if (FillStyle)
		{
			item.TextStyle.FillStyle = FillStyle;
		}
		if (LineWidth)
		{
			item.TextStyle.LineWidth = LineWidth;
		}
		if (StrokeStyle)
		{
			item.TextStyle.StrokeStyle = StrokeStyle;
		}

		item.Border = new ctk.Border();
		item.Border.BorderStyle = new ctk.Style();
		item.Border.BorderStyle.FillStyle = 'black';
		item.Border.BorderStyle.LineWidth = 3;
		item.Border.BorderStyle.StrokeStyle = 'gray';
		item.Border.BorderStyle.ShadowColor = 'gray';
		item.Border.BorderStyle.ShadowBlur = 20;
		item.Border.BorderStyle.ShadowOffsetX = 0;
		item.Border.BorderStyle.ShadowOffsetY = 0;
		item.Border.BorderDepth = 3;
		item.Border.ContentPadding = 3;
		item.ClientStyle = item.TextStyle;

		item.FitText(Context, this.AxisWidth, this.Map.TargetArea.height());

		var x = this.Map.TargetArea.x1;
		x -= this.AxisWidth; // Right side of the Axis
		x -= this.AxisWidth; // Left side of the Axis
		x += (this.AxisWidth / 2) - (item.Border.BorderRect.w / 2);
		var y = this.Map.MapY(Game.Account.AveragePrice);
		y -= (item.Border.BorderRect.h / 2)
		item.Render(Context, x, y);

		return;
	}


	//---------------------------------------------------------------------
	this.GetBarsAgoX = function GetBarsAgoX(BarsAgo)
	{
		var x = this.Map.TargetArea.x1;
		x -= this.AxisWidth; // Right side of the Axis
		x -= this.AxisWidth; // Left side of the Axis
		x -= ((BarsAgo + 1) * (this.BarWidth + this.BarSpacing));
		return x;
	}


	//---------------------------------------------------------------------
	this.DrawHistogram = function DrawHistogram(Context, BarsAgo, Value, BarColor)
	{
		var x = this.GetBarsAgoX(BarsAgo);
		var y0 = this.Map.MapY(0);
		var y1 = this.Map.MapY(Value);

		var line_style = new ctk.Style();
		line_style.LineWidth = this.BarWidth;
		line_style.FillStyle = BarColor;
		line_style.StrokeStyle = BarColor;
		ctk.DrawLineStyle(Context, x, y0, x, y1, line_style);

		return;
	}


	//---------------------------------------------------------------------
	this.DrawTickVolume = function DrawTickVolume(Context, BarsAgo, Ticks, FlatColor, BullColor, BearColor)
	{
		var x = this.GetBarsAgoX(BarsAgo);
		var y0 = this.Map.MapY(0);
		
		var tick = Ticks[ 0 ];
		var y1 = this.Map.MapY(tick.Volume);
		var last_tick = tick.Price;
		var volume = tick.Volume;

		var line_style = new ctk.Style();
		line_style.LineWidth = this.BarWidth;
		line_style.FillStyle = FlatColor;
		line_style.StrokeStyle = FlatColor;
		
		for( var tick_index = 1; tick_index < Ticks.length; tick_index++ )
		{
			tick = Ticks[ tick_index ];
			if (tick.Price > last_tick)
			{
				line_style.FillStyle = BullColor;
				line_style.StrokeStyle = BullColor;
			}
			else if (tick.Price < last_tick)
			{
				line_style.FillStyle = BearColor;
				line_style.StrokeStyle = BearColor;
			}
			else if (tick.Price === last_tick)
			{
				line_style.FillStyle = FlatColor;
				line_style.StrokeStyle = FlatColor;
			}
			volume += tick.Volume;
			y1 = this.Map.MapY(volume);
			ctk.DrawLineStyle(Context, x, y0, x, y1, line_style);
			y0 = y1;
			last_tick = tick.Price;
		}

		return;
	}


	//---------------------------------------------------------------------
	this.DrawCandle = function DrawCandle(Context, BarsAgo, Bar, BarColor, WickWidth, WickColor)
	{
		var x = this.GetBarsAgoX(BarsAgo);
		var y0 = 0;
		var y1 = 0;
		var h = 0;

		// Draw the wick.
		y0 = this.Map.MapY(Bar.Low);
		y1 = this.Map.MapY(Bar.High);
		var wick_style = new ctk.Style();
		wick_style.LineWidth = WickWidth;
		wick_style.FillStyle = WickColor;
		wick_style.StrokeStyle = WickColor;
		ctk.DrawLineStyle(Context, x, y0, x, y1, wick_style);

		// Draw the body.
		if (Bar.Close === Bar.Open)
		{
			y0 = this.Map.MapY(Bar.Open);
			// h = 1;
		}
		else if (Bar.Close > Bar.Open)
		{
			y0 = this.Map.MapY(Bar.Open);
			h = this.Map.MapY(Bar.Close) - this.Map.MapY(Bar.Open);
		}
		else if (Bar.Close < Bar.Open)
		{
			y0 = this.Map.MapY(Bar.Close);
			h = this.Map.MapY(Bar.Open) - this.Map.MapY(Bar.Close);
		}
		var bar_style = new ctk.Style();
		bar_style.LineWidth = 1;
		bar_style.FillStyle = BarColor;
		// bar_style.StrokeStyle = BarColor;
		bar_style.StrokeStyle = WickColor;
		// ctk.DrawRectStyle(Context, x - (this.BarWidth / 2), y0, this.BarWidth, h, bar_style);
		// ctk.FillRectStyle(Context, x - (this.BarWidth / 2), y0, this.BarWidth, h, bar_style);
		ctk.DrawRoundedRectStyle(Context, x - (this.BarWidth / 2), y0, this.BarWidth, h, 4, bar_style);

		return;
	}


	return;
}
