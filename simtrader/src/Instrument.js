/*
global Game
*/


function Instrument()
{
	this.Symbol = '';
	this.Name = '';
	this.Contract = '';
	this.DateText = '';
	this.TickSize = 0.00;
	this.TicksPerPoint = 1;
	this.PointValue = 0.00;
	this.Margin = 0.00;
	this.TradeFee = 0.00;
	this.Ticks = [];
	this.TicksLoaded = false;

	this.LoadTickData = function LoadTickData()
	{
		this.TicksLoaded = false;
		var instrument = this;

		$.get(
			'data/ticks/index.php?method=get-random&format=json',
			function(ResponseJson)
			{
				var response = JSON.parse(ResponseJson);
				var lines = response.data.split("\n");
				Game.Instrument.Ticks = [];
				lines.forEach(
					function(Line, UpdateElement, count)
					{
						var fields = Line.split(",");
						if (fields.length >= 3)
						{
							var tick = {
								Time: new Date(Game.Instrument.DateText + ' ' + fields[0]),
								Price: parseFloat(fields[1]),
								Volume: parseFloat(fields[2])
							};
							Game.Instrument.Ticks.push(tick);
						}
					}
				);
				Game.Instrument.TicksLoaded = true;
				Game.Update();
				return;
			}, 'text'
		);

		return;
	};


	return this;
} // function Instrument()
