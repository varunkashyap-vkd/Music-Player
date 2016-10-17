var speech = (function()
{
	var songList = [];
	var availableSongs = {};
	var recognizedSong;
	var box;
	var player;
	var songBoard;
	var heading;
	var currentSong;
	var infoBox;
	var currentIndex;
	var displayBox;

	function grabText()
	{
		if (annyang) {
			var commands = {
				'play*xyz' : getTrack,
				'remove*xyz' : remove,
				'stop' : stopCurrentSong,
				'resume' : playSong,
				'reset' : reset,
				'next song' : playNextSong,
				'previous song' : playPreviousSong,
			};

			annyang.addCommands(commands);
			annyang.start();
		}
	}

	function updateDisplay(xyz)
	{
		displayBox.innerHTML = 'Detected : ' + xyz;
	}

	function playNextSong()
	{
		console.log('next');
		if(songList.length <= 1)
		{
			return;
		}

		currentIndex++;
		if(currentIndex >= songList.length)
		{
			currentIndex = 0;
		}

		player.pause();
		player.src = availableSongs[songList[currentIndex]];
		player.load();
		player.play();
		currentSong.innerHTML = 'Playing : ' + songList[currentIndex];
		redrawSongsListOnCanvas();

		updateDisplay('Next song');
	}

	function playPreviousSong()
	{
		if(songList.length <= 1)
		{
			return;
		}

		currentIndex--;
		if(currentIndex < 0)
		{
			currentIndex = songList.length - 1;
		}
		player.pause();
		player.src = availableSongs[songList[currentIndex]];
		player.load();
		player.play();
		currentSong.innerHTML = 'Playing : ' + songList[currentIndex];
		redrawSongsListOnCanvas();

		updateDisplay('previous song');
	}

	function playSong(song)
	{
		console.log(song);

		player.play();

		updateDisplay('Resume');
	}

	function stopCurrentSong()
	{
		player.pause();
		player.currentTime = '0';

		updateDisplay('Stop');
	}

	function getTrack(val){
		recognizedSong = val.toLowerCase();

		$.ajax({
			url:"https://api.spotify.com/v1/search?q="+val.replace(" ","+")+"&type=track",

			error: function(jqXHR, textStatus, errorThrown) {
				alert(textStatus + ': ' + errorThrown);
			},
			success: loadSong,
			type:'GET',
		});

		updateDisplay('play ' + val);
	}

	function loadSong(data)
	{
		if(data == undefined)
		{
			return;
		}

		var targetUrl = data.tracks.items[0].preview_url;
		player.src = targetUrl;
		player.load();
		player.play();

		currentSong.innerHTML = 'Playing : ' + recognizedSong;

		if( !(recognizedSong in availableSongs) )
		{
			addSongToList(recognizedSong, targetUrl);
		}

		else
		{
			currentIndex = songList.indexOf(recognizedSong);
		}
		redrawSongsListOnCanvas();
	}

	function addSongToList(song, target)
	{
		currentIndex = 0;

		if(songList.length == 5)
		{
			songList.pop();
		}

		songList.unshift(recognizedSong);
		availableSongs[recognizedSong] = target;
		redrawSongsListOnCanvas();
	}

	function remove(song)
	{
		updateDisplay('Remove ' + song)
		song = song.toLowerCase();

		if( !(song in availableSongs) )
		{
			console.log('enter');
			return;
		}

		var targetIndex = songList.indexOf(song);

		if(targetIndex == currentIndex)
		{
			if(songList.length == 1)
			{
				songList.pop();
				currentIndex = -1;
			}

			else
			{
				removeItemFromList(targetIndex);
				currentIndex--;

				if(currentIndex < 0)
				{
					currentIndex = 0;
				}
			}
		}

		else
		{
			if(currentIndex > targetIndex)
			{
				currentIndex--;
			}

			removeItemFromList(targetIndex);
		}

		redrawSongsListOnCanvas();
	}

	function removeItemFromList(index)
	{
		if(songList.length == 0 || songList.length - 1 < index)
		{
			return;
		}

		temp = songList;
		songList = [];

		for(var i = 0; i < temp.length; i++)
		{
			if(i != index)
			{
				songList.push(temp[i]);
			}
		}
	}

	function reset()
	{
		location.reload();
	}

	function redrawSongsListOnCanvas()
	{
		console.log('current = ' + currentIndex);
		console.log(availableSongs);
		console.log(songList);
		console.log();

		if(songList.length == 1)
		{
			currentIndex = 0;
			heading.style.display = 'inline-block';
			infoBox.setAttribute('class', 'infoBox2');
		}

		if(songList.length == 0)
		{
			currentIndex = -1;
			currentSong.innerHTML = 'None available.'
			stopCurrentSong();

			heading.style.display = 'none';
			infoBox.setAttribute('class', 'infoBox');
		}

		while(songBoard.firstChild)
		{
			songBoard.removeChild(songBoard.firstChild);
		}

		var list = [];
		for(var i = 0; i < songList.length; i++)
		{
			var li = document.createElement('li');
			list.push(li);
			li.innerHTML = (i + 1) + '. ' + songList[i];
			songBoard.appendChild(li);
		}

		if(songList.length > 0)
		{
			list[currentIndex].style.backgroundColor = 'rgba(100 ,0, 0, 0.9)';
		}

	}

	function init(obj)
	{
		heading 	= document.getElementById(obj.heading);
		songBoard 	= document.getElementById(obj.listOfSongs);
		player 		= document.getElementById(obj.player);
		currentSong = document.getElementById(obj.currentlyPlaying);
		infoBox 	= document.getElementById(obj.info);
		displayBox 	= document.getElementById(obj.displayBox);
		currentIndex = -1;

		grabText();
	}

	return {
		init : init,
	};

})();








