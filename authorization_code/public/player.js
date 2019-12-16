// Set access token with TOKEN value in console
const access_token = 'BQDL9L1-V40MRXMDAXrraz-XtvrYc9KlT7_hdyERVRwjTkTJ4BnKW_XJA3iNxq70TI3UX_iPI143aUFtuzIj4hyWYe1VJtqec7_x9UW4IlinNtsgYlYdLroKsW8DbDwrkgK85h0mcB2GackihZdQbR7L-TQbSsgPj2U6k5pqhWh9umFd8HYV9YkvrFnOPqk_sc4UK7_c7P4YYIh4VCWTpaJ6Oc0NW2TBgTldzA';

var user_id = "";
var playlist_id = "";
var url = new URL(window.location.href);
var queue_name = url.searchParams.get("queueName");
var queue_code = url.searchParams.get("queueCode");
var queue = []; // tuples of (uri, score)
var track_ctr = 0; // for keeping track of the HTML id's of the tracks in the playlist

// PUT THIS IN IF YOU WANT A WEB SDK
// FUNCTIONALITY STILL WORKS IF YOU HAVE SPOTIFY PLAYING SOMEWHERE

// window.onSpotifyWebPlaybackSDKReady = () => {
//   const player = new Spotify.Player({
//     name: 'Web Playback SDK Quick Start Player',
//     getOAuthToken: cb => { cb(access_token); }
//   });

//   // Error handling
//   player.addListener('initialization_error', ({ message }) => { console.error(message); });
//   player.addListener('authentication_error', ({ message }) => { console.error(message); });
//   player.addListener('account_error', ({ message }) => { console.error(message); });
//   player.addListener('playback_error', ({ message }) => { console.error(message); });

//   // Playback status updates
//   player.addListener('player_state_changed', state => { console.log(state); });

//   // Ready
//   player.addListener('ready', ({ device_id }) => {
//     console.log('Ready with Device ID', device_id);
//   });

//   // Not Ready
//   player.addListener('not_ready', ({ device_id }) => {
//     console.log('Device ID has gone offline', device_id);
//   });

//   // Connect to the player!
//   player.connect();
// };

if (access_token) {
  $.ajax({
    type: 'GET',
    url: 'https://api.spotify.com/v1/me',
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'
    },
    success: function(response) {
      // Store userid
      user_id = response.id;
      console.log("user id fetched:" + user_id);
      
      // Create temporary playlist
      if(window.location.pathname == '/player.html') {
        createPlaylist();
      } else if (window.location.pathname == '/join.html') {
        getPlaylist();
      }
    }
  });
} else {
  // render initial screen
  $('#login').show();
  $('#loggedin').hide();
}

// SEARCH
$('#searchbar').submit(function() {
  let query = $('#searchbar').serialize();
  query = query.substring(6, query.length);
  searchForTrack(query);
  return false;
});

// upvote handler
$("#playlist").on('click', '.up', function () {
  let id = '#score' + this.id;
  $(id).html(function(i, val) { return parseInt(val) + 1 }); // update the score in HTML
  queue[parseInt(this.id)-1][0]++; // update the score in backend queue
  console.log(queue);
  // TODO: not working properly
  // when sorted, the clicked id - 1 is not referring to the same song
  // backend queue is sorted, but front end doesn't reorder
  // queue.sort();
});

// downvote handler
$("#playlist").on('click', '.down', function () {
  let id = '#score' + this.id;
  $(id).html(function(i, val) { return parseInt(val) - 1 }); // update the score in HTML
  queue[parseInt(this.id)-1][0]--; // update the score in backend queue
  console.log(queue);
  // TODO: not working properly
  // when sorted, the clicked id - 1 is not referring to the same song
  // backend queue is sorted, but front end doesn't reorder
  // queue.sort();
});

// previous song
$("#prev").on('click', function() {
  $.ajax({
    type: 'POST',
    url: 'https://api.spotify.com/v1/me/player/previous',
    headers: {
    'Authorization': 'Bearer ' + access_token,
    },
    success: function(response) {
      console.log("SWITCH TO PREVIOUS SONG")
    }
  });
});

// play if music isn't playing
$("#play").on('click', function() {
  $.ajax({
    type: 'GET',
    url: 'https://api.spotify.com/v1/me/player/devices',
    headers: {
    'Authorization': 'Bearer ' + access_token,
    },
    success: function(response) {
      // PRINT what devices are active
      console.log(response)
    }
  });
  $.ajax({
    type: 'PUT',
    // url: 'https://api.spotify.com/v1/me/player/play?device_id=' + response.devices[0].id,
    url: 'https://api.spotify.com/v1/me/player/play',
    headers: {
    'Authorization': 'Bearer ' + access_token,
    'Content-Type': 'application/json'
    },
    success: function(response) {
      console.log("PLAYING")
    }
  });
});

// next song
$("#next").on('click', function() {
  $.ajax({
    type: 'POST',
    url: 'https://api.spotify.com/v1/me/player/next',
    headers: {
    'Authorization': 'Bearer ' + access_token,
    },
    success: function(response) {
      console.log("SWITCH TO NEXT SONG")
    }
  });
});

function getPlaylist() {
  $.ajax({
    type: 'GET',
    url: 'https://api.spotify.com/v1/playlists/' + queue_code,
    headers: {
      'Authorization': 'Bearer ' + access_token,
    },
    success: function(response) {
      // Set global playlist_id to the fetched playlist's id
      console.log(response);
      playlist_id = response.id;
      let curr_tracks = response.tracks.items;

      // render all the existing songs in the playlist in our UI
      for (let i = 0; i < curr_tracks.length; ++i) {
        let track_name = curr_tracks[i].track.name;
        let artist = curr_tracks[i].track.artists[0].name;
        let track_uri = curr_tracks[i].track.uri;
        const track_html = '<div class="playlist_track"><p class="playlist_track">' + track_name + ' – ' + artist + '</p><button class="up" id="' + track_ctr + '"> ↑ </button><span id="score' + track_ctr+ '">0</span><button class="down" id="' + track_ctr + '"> ↓ </button></div>';
        $('#playlist').append(track_html);
        queue.push([0, track_uri]); // push new track into backend queue
      }
    } 
  });
}

function createPlaylist() {
  $.ajax({
    type: 'POST',
    url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists',
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      name: queue_name,
      public: false,
    }),
    json: true,
    success: function(response) {
      // Store playlist id
      playlist_id = response.id;
      console.log("Fetched playlist id: " + playlist_id);
      console.log("Queue name: " + queue_name);
      let code_html = '<p id="code"><b>Code:</b> ' + playlist_id + '</p>';
      $('#sharing').append(code_html);
    } 
  });
}

function searchForTrack(query) {
  $.ajax({
    type: 'GET',
    url: 'https://api.spotify.com/v1/search?q=' + query + '&type=track,artist&market=US',
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    success: function(response) {
      $('#results').show();

      // Display query results so that user can select song to add
      var list = document.getElementById('results');
      list.innerHTML = "";
      response.tracks.items.map(item => {
        let query = document.createElement("li");
        query.appendChild(document.createTextNode(item.name + ' - ' + item.artists[0].name));
        // Add onclick function to add track to queue
        query.onclick = function() {
          let track_id = item.id;
          let artist = item.artists[0].name;
          let track_name = item.name;
          getTrack(track_id, artist,track_name);
        };
        list.append(query);
      })
    }
  });
}

function getTrack(track_id, artist, track_name) {
  // Use the song's trackid to find track uri to add song
  $.ajax({
    type: 'GET',
    url: 'https://api.spotify.com/v1/tracks/' + track_id,
    headers: {
      'Authorization': 'Bearer ' + access_token
    },
    success: function(response) {
      const track_uri = response.uri;
      addTrackToQueue(track_uri, artist, track_name);
    }
  });
}

function addTrackToQueue(track_uri, artist, track_name) {
  // Add track to Spotify
  $.ajax({
    type: 'POST',
    url: 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks',
    headers: {
      'Authorization': 'Bearer ' + access_token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: JSON.stringify({uris: [track_uri]}),
    json: true,
    success: function(response) {
      console.log("adding " + track_name + " by " + artist + " to playlist " + playlist_id);
    }
  });
  // UI update
  track_ctr++;
  const track_html = '<div class="playlist_track"><p class="playlist_track">' + track_name + ' – ' + artist + '</p><button class="up" id="' + track_ctr + '"> ↑ </button><span id="score' + track_ctr+ '">0</span><button class="down" id="' + track_ctr + '"> ↓ </button></div>';
  $('#playlist').append(track_html);
  queue.push([0, track_uri]); // push new track into backend queue
  console.log(queue);
}

