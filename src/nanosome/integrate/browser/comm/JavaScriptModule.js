function() {
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(elt /*, from*/) {
			var len = this.length;
			var from = Number(arguments[1]) || 0;
			from = (from < 0)
				? Math.ceil(from)
				: Math.floor(from);
			if (from < 0)
				from += len;
			
			for (; from < len; from++) {
				if (from in this &&
					this[from] === elt)
				return from;
			}
			return -1;
		};
	}
	if( !( nanosome && nanosome.comm ) ) {
		var isIE = !+"\v1"; // http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
		var nanosome = nanosome || (nanosome = {});
		if( !nanosome.comm ) {
			nanosome.comm = {
				isIE: isIE,
				globalTempId: 0,
				callRegistry: {},
				objectRegistry: {},
				moduleRegistry: {},
				tempId: function() {
					return ++this.globalTempId;
				},
				registerFlash: function( url, objectId, tempId ) {
					try {
						if( objectId ) {
							var flash = getFlash( objectId );
							if( flash.nanosome_tempId() == tempId ) {
								this.callRegistry[ tempId ] = objectId;
								this.objectRegistry[ objectId ] = tempId;
								return tempId;
							}
						}
					} catch(e) {}
					
					// Fix all unfixed flash entries in html
					
					var embedNodes = document.getElementsByTagName( "embed" );
					for( var i = 0; i<embedNodes.length; ++i ) {
						var embedNode = embedNodes[i];
						var id = embedNode.getAttribute("name");
						if( !this.objectRegistry[ id ] && this.urlMatch( embed.getAttribute("src"), url ) ) {
							this.replaceNode( embedNode );
							return null;
						}
					}
					return null;
				},
				register: function( moduleId, module ) {
					this.moduleRegistry[ moduleId ] = module;
				},
				unregister: function( moduleId, module ) {
					delete this.moduleRegistry[ moduleId ];
				},
				callModule: function( moduleId, method, args ) {
					var instance = this.moduleRegistry[ moduleId ];
					instance[method].apply(instance, args);
				},
				urlMatch: function( relUrl, url ) {
					return true;
				},
				call: function( commId, method, args ) {
					var split = commId.split("::");
					this.getFlash( this.callRegistry[ split[0] ] ).nanosome_call( split[1], method, args );
				},
				getAttributes: function( node ) {
					var result = {};
					for( var i = 1; i<arguments.length; ++i ) {
						var value = node.getAttribute( arguments[i] );
						if( value ) {
							result[ arguments[i] ] = value;
						}
					}
					return result;
				},
				replaceNode: function( embedNode ) {
					var replaceNode = embedNode;
					var parent = embedNode.parentNode;
					if( parent.nodeName == "OBJECT" ) {
						replaceNode = parent;
						parent = parent.parentNode;
					}
					
					var atts = this.getAttributes( embedNode, "width", "height", "align", "style" );
					atts.id = embedNode.getAttribute("name");
					
					if( !atts.id ) {
						atts.id = "nanosome#" + i + "@" + new Date().getTime();
					}
					var pars = this.getAttributes( embedNode, "swliveconnect", "play", "loop", "menu", "quality", "scale", "wmode", "bgcolor", "base", "flashvars", "allowScriptAccess" );
					pars.movie = embedNode.getAttribute("src");
					
					var embat = '';
					var att = '';
					for( var name in atts ) {
						if( name == "style" && typeof atts[name] == "object" ) {
							var style = atts[name];
							var styleCSS = "";
							for( var styleName in style ) {
								if( style[styleName] ) {
									styleCSS += styleName +':'+style[styleName]+';';
								}
							}
							embat += ' style="' + styleCSS + '"';
						} else {
							att += ' ' + name + '="' + atts[name] + '"';
							if( name != "id" ) {
								embat += ' ' + name + '="' + atts[name] + '"';
							} else {
								embat += ' name="' + atts[name] + '"';
							}
						}
					}
					
					var par = '';
					for( var name in pars ) {
						var val = pars[name];
						par += '<param name="' + name + '" value="' + val + '"/>';
						if( name == "movie" ) {
							name = "src";
						}
						embat += ' ' + name + '="' + val + '"';
					}
					
					embedNode = null;
					
					var newNode = document.createElement( 'object' );
					
					replaceNode.classid= "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";
					replaceNode.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '<embed ' + embat + ' /></object>';
				},
				getFlash: function( id ) {
					return (isIE ? window : document)[id];
				}
			};
		}
	}
}