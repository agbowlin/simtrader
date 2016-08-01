


function ChartBars()
{
	this.Bars = [ ];
	this.Last = null;
	this.High = null;
	this.Low = null;
	this.HighVolume = null;


	//---------------------------------------------------------------------
	this.Reset = function Reset()
	{
		this.Bars = [ ];
		this.Last = null;
		this.High = null;
		this.Low = null;
		this.Volume = null;
		this.HighVolume = null;
		return;
	}


	//---------------------------------------------------------------------
	this.AddTick = function AddTick( Tick )
	{
		var bar = null;

		// Update chart bars.
		if( this.Bars.length === 0 )
		{
			// Create a new bar from the tick.
			bar = this.AddBar( Tick );
		}
		else
		{
			var bar_index = this.Bars.length - 1;
			bar = this.Bars[ bar_index ];
			var t0 = new Date( bar.Time );
			t0.setMilliseconds( 0 );
			t0.setSeconds( 0 );
			var t1 = new Date( Tick.Time );
			t1.setMilliseconds( 0 );
			t1.setSeconds( 0 );
			if( t1 > t0 )
			{
				// Create a new bar from the tick.
				bar = this.AddBar( Tick );
			}
			else
			{
				// Aggregate tick into the last bar.
				if( bar.High < Tick.Price )
				{
					bar.High = Tick.Price;
				}
				if( bar.Low > Tick.Price )
				{
					bar.Low = Tick.Price;
				}
				bar.Close = Tick.Price;
				bar.Volume += Tick.Volume;
			}
		}

		if( this.Low === null )
		{
			this.Low = bar.Low;
		}
		else if( this.Low > bar.Low )
		{
			this.Low = bar.Low;
		}

		if( this.High === null )
		{
			this.High = bar.High;
		}
		else if( this.High < bar.High )
		{
			this.High = bar.High;
		}

		if( this.HighVolume === null )
		{
			this.HighVolume = bar.Volume;
		}
		else if( this.HighVolume < bar.Volume )
		{
			this.HighVolume = bar.Volume;
		}

		bar.Ticks.push( Tick );
		
		this.Last = bar.Close;
		this.Volume = bar.Volume;

		// Return, OK
		return;
	};


	//---------------------------------------------------------------------
	this.AddBar = function AddBar( Tick )
	{
		var bar =
			{
				Time: Tick.Time
				, Open: Tick.Price
				, High: Tick.Price
				, Low: Tick.Price
				, Close: Tick.Price
				, Volume: Tick.Volume
				, Ticks: [] // new Array()
			};
		this.Bars.push( bar );
		return bar;
	};


	return;
}

