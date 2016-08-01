/*
global ctk
global PageView
global LifeGame
global Game
*/


//--------------------------------------------------------------------------
//  Misc functions
//--------------------------------------------------------------------------


//---------------------------------------------------------------------
function GetCanvasEventPoint(Canvas, Event)
{
	var rect = Canvas.getBoundingClientRect();
	var point = new ctk.Point();
	point.x = Event.clientX - rect.left;
	point.y = Event.clientY - rect.top;
	return point;
}


//---------------------------------------------------------------------
function SetCookie(CookieName, CookieValue, ExpireDays)
{
	var expires = '';
	if (ExpireDays > 0)
	{
		var d = new Date();
		d.setTime(d.getTime() + (ExpireDays * 24 * 60 * 60 * 1000));
		expires = "expires=" + d.toUTCString();
	}
	document.cookie = CookieName + "=" + CookieValue + "; " + expires;
	return;
}

//---------------------------------------------------------------------
function GetCookie(CookieName)
{
	var name = CookieName + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++)
	{
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

//---------------------------------------------------------------------
function CheckCookie()
{
	var user = GetCookie("username");
	if (user != "")
	{
		alert("Welcome again " + user);
	}
	else
	{
		user = prompt("Please enter your name:", "");
		if (user != "" && user != null)
		{
			SetCookie("username", user, 365);
		}
	}
}


//---------------------------------------------------------------------
function setToken(key, value)
{
	sessionStorage.setItem(key, value);
}


//---------------------------------------------------------------------
function getToken(key)
{
	return sessionStorage.getItem(key);
}


//---------------------------------------------------------------------
function removeToken(key)
{

	$.api.logout(function(data)
	{
		if (data.success)
		{
			sessionStorage.removeItem(key);
			$.route('index');
		}
		else
		{
			var response = parseResponse(data);
			MessageBox(response.code, response.message, response.error);
		}
	});
}


//---------------------------------------------------------------------
function clearForm()
{
	$('input').each(function()
	{
		$(this).val('');
	});
}


//---------------------------------------------------------------------
function MessageBox(title, body, error)
{
	$('#messagebox-title').html(title);
	$('#messagebox-body').html(body);
	$('#messagebox-error').html(error);
	$('#messagebox-modal').modal('show');
}


//---------------------------------------------------------------------
function parseResponse(response)
{
	var responseObj = jQuery.parseJSON(response.responseText);

	if (responseObj.hasOwnProperty('error'))
	{
		if (responseObj.error.context !== null)
		{
			var errMsg = '';

			$.each(responseObj.error.context, function(data)
			{
				errMsg += '<br> - ' + responseObj.error.context[data][0].replace(/&quot;/g, '\"');
			});

			var message = responseObj.error.message + '<br>' + errMsg;
			return {
				code: responseObj.error.code,
				message: message,
				error: JSON.stringify(response)
			};
		}
		else
		{
			return {
				code: responseObj.error.code,
				message: responseObj.error.message.replace(/&quot;/g, '\"'),
				error: JSON.stringify(response)
			};
		}
	}
	else
	{
		return false;
	}
}
