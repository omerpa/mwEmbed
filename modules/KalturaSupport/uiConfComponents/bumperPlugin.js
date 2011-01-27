/**
* Adds bumper support
*/
$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$j( embedPlayer ).bind( 'KalturaSupport.checkUiConf', function( event, $uiConf, callback ){
		
		//<plugin id="bumper" bumperentryid="1_187nvs4c" clickurl="http://www.nokia.com" lockui="true" playonce="false" presequence="1" width="100%" height="100%"></plugin>
		
		var $bumbPlug = $uiConf.find("plugin#bumper");
		if(  $bumbPlug.length ){
			var bumperEntryId = $bumbPlug.attr('bumperentryid');
			var bumperClickUrl = $bumbPlug.attr('clickurl');
			var clickedBumper = false;
			embedPlayer.bumperPlayCount = 0;
			// Get the bumper entryid			
			if( bumperEntryId ){
				mw.log( "KWidget:: checkUiConf: get sources for " + bumperEntryId);
				var originalSrc = embedPlayer.getSrc();
				mw.getEntryIdSourcesFromApi( $j( embedPlayer ).attr( 'kwidgetid' ), bumperEntryId, function( sources ){
					// Add to the bumper per entry id:						
					$j( embedPlayer ).unbind('play.bumper').bind('play.bumper', function(){	
						// don't play the bumper 
						if( $bumbPlug.attr('playonce') == "true" && embedPlayer.bumperPlayCount >= 1){
							return true;
						}
						if( $bumbPlug.attr('playonce') == "false" && embedPlayer.bumperPlayCount > embedPlayer.donePlayingCount ){
							// don't play the bumper again we are done playing once
							return true;
						}
						
						embedPlayer.bumperPlayCount++;
						
						if( $bumbPlug.attr('lockui') == "true" ){
							embedPlayer.disableSeekBar();
						}
						// Call the special insertAndPlaySource function ( used for ads / video inserts ) 
						embedPlayer.switchPlaySrc( sources[0].src, null, function(){
							// restore the orginal source:
							embedPlayer.switchPlaySrc( originalSrc );
							embedPlayer.enableSeekBar();
						});
					});
					if( bumperClickUrl ){
						$j( embedPlayer ).click( function(){
							// try to do a popup:
							if(!clickedBumper){
								clickedBumper = true;
								window.open( bumperClickUrl );								
								return false;
							}
							return true;							
						})
					}
					// run callback once bumper has been looked up
					callback();
				});
				/* TODO better error handle for failed bumper lookup */
			}
		} else {
			// Don't block player display if no bumper found 
			callback();
		}
	})
})