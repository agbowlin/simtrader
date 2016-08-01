/*
global ctk
global ctk.ProcessLoop
global Instrument
global ChartBars
global ChartArea
global AccountManager
*/


//---------------------------------------------------------------------
var Game = null;


//---------------------------------------------------------------------
function GameUpdate()
{
	Game.Update();
	return;
}


//---------------------------------------------------------------------
function ChartGame(Canvas, UpdateUI)
{
	this.Loop = new ctk.ProcessLoop(GameUpdate, 100);
	this.GameSpeed = 1.0;
	this.GameStarted = false;
	this.GamePaused = true;

	this.LastGameTime = null;
	this.GameTime = null;
	this.LastRealTime = null;
	this.RealTime = null;
	this.FPS = 0.0;

	this.Canvas = Canvas;
	this.UpdateUI = UpdateUI;

	this.Instrument = new Instrument();
	this.CurrentTickIndex = 0;

	this.Bars = new ChartBars();

	this.BarsArea = new ChartArea();
	this.BarsArea.BarWidth = 10;
	this.BarsArea.BarSpacing = 3;
	this.BarsArea.AxisLabelDecimalPlaces = 2;

	this.VolumeArea = new ChartArea();
	this.VolumeArea.BarWidth = this.BarsArea.BarWidth;
	this.VolumeArea.BarSpacing = this.BarsArea.BarSpacing;

	this.Account = new AccountManager();

	this.WickWidth = 1;
	// this.WickColor = "#FFD700";
	// this.WickColor = "#7070FF";
	this.WickColor = "#7070A0";

	//this.FlatColor = "#FFD700";
	this.FlatColor = "#808080";

	//this.BullColor = "#3DB417";
	// this.BullColor = "#33FF33";
	this.BullColor = "#33FF66";

	//this.BearColor = "#E61F44";
	// this.BearColor = "#FF3333";
	this.BearColor = "#FF3366";


	//---------------------------------------------------------------------
	this.ResetGame = function ResetGame()
	{
		this.GameTime = null;
		this.GameStarted = false;
		this.GamePaused = true;
		this.Bars.Reset();
		this.Loop.Reset();
		this.Loop.StartProcess();
		// this.Update();
		return;
	};


	//---------------------------------------------------------------------
	this.StartGame = function StartGame()
	{
		this.GameTime = null;
		this.GameStarted = true;
		this.GamePaused = false;
		return;
	};


	//---------------------------------------------------------------------
	this.PauseGame = function PauseGame()
	{
		this.GamePaused = true;
		return;
	};


	//---------------------------------------------------------------------
	this.ResumeGame = function ResumeGame()
	{
		this.GamePaused = false;
		return;
	};


	//---------------------------------------------------------------------
	this.StopGame = function StopGame()
	{
		this.GamePaused = true;
		this.Loop.StopProcess();
		return;
	};


	//---------------------------------------------------------------------
	this.GameDone = function GameDone()
	{
		if (this.CurrentTickIndex < this.Instrument.Ticks.length)
		{
			return false;
		}
		else
		{
			return true;
		}
	};


	//---------------------------------------------------------------------
	this.Buy = function Buy(Amount)
	{
		this.Account.ExecuteTrade(this.Instrument, Amount, this.Bars.Last);
		return;
	};


	//---------------------------------------------------------------------
	this.Sell = function Sell(Amount)
	{
		this.Account.ExecuteTrade(this.Instrument, -Amount, this.Bars.Last);
		return;
	};


	//---------------------------------------------------------------------
	this.Flat = function Flat()
	{
		if (this.Account.PositionSize > 0)
		{
			this.Sell(this.Account.PositionSize);
		}
		else if (this.Account.PositionSize < 0)
		{
			this.Buy((-this.Account.PositionSize));
		}
		return;
	};


	//---------------------------------------------------------------------
	this.Update = function Update()
	{
		// Get the real elapsed time.
		this.RealTime = new Date();
		if (this.LastRealTime === null)
		{
			this.LastRealTime = new Date(this.RealTime.getTime());
		}
		var real_ms = this.RealTime - this.LastRealTime;
		this.FPS = (1000 / real_ms);
		this.LastRealTime = new Date(this.RealTime.getTime());

		// Update the game time.
		if (this.GameStarted === true)
		{
			if (this.GamePaused === false)
			{
				if (this.CurrentTickIndex < this.Instrument.Ticks.length)
				{
					// Get the game elapsed time.
					var tick = this.Instrument.Ticks[this.CurrentTickIndex];
					var game_ms = (real_ms * this.GameSpeed);
					if (this.GameTime === null)
					{
						this.GameTime = new Date(tick.Time);
					}
					else
					{
						var new_time_ms = (this.GameTime.getTime() + game_ms);
						this.GameTime.setTime(new_time_ms);
					}
					//console.log( this.GameSpeed + ' | ' + real_ms + ' | ' + game_ms + ' | ' + new_time_ms + ' | ' + this.GameTime.toLocaleTimeString() );
					if (this.LastGameTime === null)
					{
						this.LastGameTime = new Date(this.GameTime.getTime());
					}

					// Add ticks to catch up with the game time.
					while (tick.Time <= this.GameTime)
					{
						this.Bars.AddTick(tick);
						if (this.CurrentTickIndex >= this.Instrument.Ticks.length)
						{
							break;
						}
						this.CurrentTickIndex++;
						tick = this.Instrument.Ticks[this.CurrentTickIndex];
					}

				}
			}
		}

		// Update the area map.
		this.BarsArea.Map.SourceArea.CoordinateSystem = 'cartesian';
		this.BarsArea.Map.SourceArea.x0 = 0;
		this.BarsArea.Map.SourceArea.x1 = this.Canvas.width;
		this.BarsArea.Map.SourceArea.y0 = this.Bars.Low - (this.Instrument.TicksPerPoint * this.Instrument.TickSize);
		this.BarsArea.Map.SourceArea.y1 = this.Bars.High + (this.Instrument.TicksPerPoint * this.Instrument.TickSize);

		this.BarsArea.Map.TargetArea.CoordinateSystem = 'screen';
		this.BarsArea.Map.TargetArea.x0 = 0;
		this.BarsArea.Map.TargetArea.x1 = this.Canvas.width;
		this.BarsArea.Map.TargetArea.y0 = 0;
		this.BarsArea.Map.TargetArea.y1 = this.Canvas.height * 0.67;

		this.VolumeArea.Map.SourceArea.CoordinateSystem = 'cartesian';
		this.VolumeArea.Map.SourceArea.x0 = 0;
		this.VolumeArea.Map.SourceArea.x1 = this.Canvas.width;
		this.VolumeArea.Map.SourceArea.y0 = 0;
		this.VolumeArea.Map.SourceArea.y1 = this.Bars.HighVolume;

		this.VolumeArea.Map.TargetArea.CoordinateSystem = 'screen';
		this.VolumeArea.Map.TargetArea.x0 = 0;
		this.VolumeArea.Map.TargetArea.x1 = this.Canvas.width;
		this.VolumeArea.Map.TargetArea.y0 = this.BarsArea.Map.TargetArea.y1 + 1;
		this.VolumeArea.Map.TargetArea.y1 = this.Canvas.height;

		this.DrawBars();

		if (this.UpdateUI)
		{
			this.UpdateUI();
		}

		return;
	};


	// //---------------------------------------------------------------------
	// this.DrawPriceMarker = function DrawPriceMarker(Context, ChartRect, Price)
	// {
	// 	var item = new ctk.Item();
	// 	item.Text = Price + ' | 00s';
	// 	item.FitText( Context, this.Canvas.width, this.Canvas.height );
	// 	var x = ChartRect.x2() + 10;
	// 	item.Render( Context );
	// 	return;
	// };


	//---------------------------------------------------------------------
	this.GetBullBearColor = function GetBullBearColor(Value)
	{
		if (Value > 0)
		{
			return this.BullColor;
		}
		else if (Value < 0)
		{
			return this.BearColor;
		}
		return this.FlatColor;
	};


	//---------------------------------------------------------------------
	this.DrawBars = function DrawBars()
	{
		var context = this.Canvas.getContext('2d');
		context.save();

		var chart_rect = new ctk.Rect(0, 0, Game.Canvas.width, Game.Canvas.height);
		ctk.ClearRect(context, chart_rect.x, chart_rect.y, chart_rect.w, chart_rect.h);

		// Draw the chart background.
		this.BarsArea.DrawBackground(context);
		this.VolumeArea.Map.SourceArea.y1 = this.Bars.HighVolume;
		this.VolumeArea.DrawBackground(context);

		// Draw the Price (Y) axis.
		this.BarsArea.DrawAxisY(context, this.Bars.High, this.Bars.Low);

		// Draw the current Price and Volume.
		if (this.Bars.Last)
		{
			var seconds = this.GameTime.getSeconds();
			seconds = (60 - seconds) - 1;
			var text = this.Bars.Last.toFixed(this.BarsArea.AxisLabelDecimalPlaces);
			text += ' ~ ';
			text += seconds + 's';
			this.BarsArea.DrawAxisYMarker(context, this.Bars.Last, text, '12px Roboto', 'yellow');

			text = this.Bars.Volume;
			this.VolumeArea.DrawAxisYMarker(context, this.Bars.Volume, text, '12px Roboto', 'yellow');
		}

		// Draw the current position.
		var profit_loss_points = Math.sign(Game.Account.PositionSize) * (Game.Bars.Last - Game.Account.AveragePrice);
		var profit_loss_dollars = Math.abs(Game.Account.PositionSize) * (Game.Instrument.PointValue * profit_loss_points);
		this.BarsArea.DrawTrade(context, Game, '12px Roboto', this.GetBullBearColor(profit_loss_points));

		// Update the bars.
		var bars_ago = 0;
		for (var bar_index = (this.Bars.Bars.length - 1); bar_index >= 0; bar_index--)
		{
			var bar = this.Bars.Bars[bar_index];
			var fill_style = this.GetBullBearColor(bar.Close - bar.Open);
			this.VolumeArea.DrawHistogram(context, bars_ago, bar.Volume, fill_style);
			// this.VolumeArea.DrawTickVolume(context, bars_ago, bar.Ticks, this.FlatColor, this.BullColor, this.BearColor);

			fill_style = this.GetBullBearColor(bar.Close - bar.Open);
			if (bar.Close === bar.Open)
			{
				fill_style = this.WickColor;
			}
			this.BarsArea.DrawCandle(context, bars_ago, bar, fill_style, this.WickWidth, this.WickColor);

			bars_ago++;
		}

		context.restore();
		return;
	};


	return;
}
