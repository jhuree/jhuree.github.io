var token;

(function() {
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
      alert('There was an error during the authentication');
    } else {
      if (access_token) {

        // SET GLOBAL VAR FOR TOKEN
        token = access_token;
        console.log("TOKEN: " + token);

        $.ajax({
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          success: function(response) {
            $('#login').hide();
            $('#loggedin').show();
          }
        });
      } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
      }

      // GET NEW TOKEN
      if (window.location.pathname == '/index.html') {
        document.getElementById('obtain-new-token').addEventListener('click', function() {
          $.ajax({
            url: '/refresh_token',
            data: {
              'refresh_token': refresh_token
            }
          }).done(function(data) {
            access_token = data.access_token;
            token = access_token;
            console.log("REFRESH TOKEN: " + token);
          });
        }, false);
      }
    }
  })();