function() {
	
	if( !(window.tv && window.tv.make && window.tv.make.screen) ) {
		var tv = window.tv || (window.tv = {});
		if( !tv.make ) {
			tv.make = {};
		}
		if( !tv.make.screen ) {
			tv.make.screen = {};
		}
		function now() {
			return (new Date).getTime();
		}
		
		var isIE = !+"\v1"; // http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
		
	// ----------------------------------------------------------------------------
	// ----------------------------------------------------------------------------
	//                           Copied and Adapted FROM JQUERY
	// ----------------------------------------------------------------------------
	// ----------------------------------------------------------------------------
		
		// Figure out if the W3C box model works as expected
		// document.body must exist before we can do this
		var root = document.documentElement,
			script = document.createElement("script"),
			div = document.createElement("div"),
			id = "script" + now();
		
		div.style.display = "none";
		div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
		
		var all = div.getElementsByTagName("*"),
			a = div.getElementsByTagName("a")[0];
		// Can't get basic test support
		if ( !all || !all.length || !a ) {
			tv.make.support = {};
		} else {
			var div = document.createElement("div");
			div.style.width = div.style.paddingLeft = "1px";
			
			document.body.appendChild( div );
			tv.make.support = {
				boxModel: div.offsetWidth === 2,
				cssFloat: !!a.style.cssFloat
			}
			document.body.removeChild( div ).style.display = 'none';
			
			div = null;
		}
		
		var getComputedStyle = document.defaultView && document.defaultView.getComputedStyle;
		var rfloat = /float/i,
			rupper = /([A-Z])/g,
			rdashAlpha = /-([a-z])/ig,
			rnumpx = /^-?\d+(?:px)?$/i,
			rnum = /^-?\d/,
			styleFloat = tv.make.support.cssFloat ? "cssFloat" : "styleFloat",
			fcamelCase = function( all, letter ) {
				return letter.toUpperCase();
			};
		
		
		tv.make.curCSS = function( elem, name, force ) {
			var ret, style = elem.style, filter;
			
			// Make sure we're using the right name for getting the float value
			if ( rfloat.test( name ) ) {
				name = styleFloat;
			}
			
			if ( !force && style && style[ name ] ) {
				ret = style[ name ];
			} else if ( getComputedStyle ) {
				// Only "float" is needed here
				if ( rfloat.test( name ) ) {
					name = "float";
				}
				
				name = name.replace( rupper, "-$1" ).toLowerCase();
				
				var defaultView = elem.ownerDocument.defaultView;
				
				if ( !defaultView ) {
					return null;
				}
				
				var computedStyle = defaultView.getComputedStyle( elem, null );
				
				if ( computedStyle ) {
					ret = computedStyle.getPropertyValue( name );
				}
				
				// We should always get a number back from opacity
				if ( name === "opacity" && ret === "" ) {
					ret = "1";
				}
				
			} else if ( elem.currentStyle ) {
				var camelCase = name.replace(rdashAlpha, fcamelCase);
		
				ret = elem.currentStyle[ name ] || elem.currentStyle[ camelCase ];
		
				// From the awesome hack by Dean Edwards
				// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
		
				// If we're not dealing with a regular pixel number
				// but a number that has a weird ending, we need to convert it to pixels
				if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
					// Remember the original values
					var left = style.left, rsLeft = elem.runtimeStyle.left;
		
					// Put in the new values to get a computed value out
					elem.runtimeStyle.left = elem.currentStyle.left;
					style.left = camelCase === "fontSize" ? "1em" : (ret || 0);
					ret = style.pixelLeft + "px";
					
					// Revert the changed values
					style.left = left;
					elem.runtimeStyle.left = rsLeft;
				}
			}
			return ret;
		}
		
		tv.make.offset = {
			initialize: function() {
				var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( tv.make.curCSS(body, "marginTop", true) ) || 0,
					html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";
				
				var style = container.style || (container.style = {});
				style.position = "absolute";
				style.top = 0;
				style.left = 0;
				style.margin = 0;
				style.border = 0;
				style.width = "1px";
				style.height = "1px";
				style.visibility = "hidden";
				
				container.innerHTML = html;
				body.insertBefore( container, body.firstChild );
				innerDiv = container.firstChild;
				checkDiv = innerDiv.firstChild;
				td = innerDiv.nextSibling.firstChild.firstChild;
				
				this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
				this.doesAddBorderForTableAndCells = (td.offsetTop === 5);
				
				checkDiv.style.position = "fixed", checkDiv.style.top = "20px";
				// safari subtracts parent border width here which is 5px
				this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
				checkDiv.style.position = checkDiv.style.top = "";
				
				innerDiv.style.overflow = "hidden", innerDiv.style.position = "relative";
				this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);
				
				this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);
				
				body.removeChild( container );
				body = container = innerDiv = checkDiv = table = td = null;
				tv.make.offset.initialize = function() {};
			},
			
			bodyOffset: function( body ) {
				var top = body.offsetTop, left = body.offsetLeft;
				
				tv.make.offset.initialize();
				
				if ( tv.make.offset.doesNotIncludeMarginInBodyOffset ) {
					top  += parseFloat( tv.make.curCSS(body, "marginTop",  true) ) || 0;
					left += parseFloat( tv.make.curCSS(body, "marginLeft", true) ) || 0;
				}
				
				return { top: top, left: left };
			}
		};
		if ( "getBoundingClientRect" in document.documentElement ) {
			tv.make.offsetFor = function( elem ) {
				if ( !elem || !elem.ownerDocument ) {
					return null;
				}
				
				if ( elem === elem.ownerDocument.body ) {
					return tv.make.offset.bodyOffset( elem );
				}
				
				var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
					clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
					top  = box.top  + (self.pageYOffset || tv.make.support.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
					left = box.left + (self.pageXOffset || tv.make.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;
				
				return { top: top, left: left };
			};
		
		} else {
			tv.make.offsetFor = function( elem ) {
				if ( !elem || !elem.ownerDocument ) {
					return null;
				}
				
				if ( elem === elem.ownerDocument.body ) {
					return tv.make.offset.bodyOffset( elem );
				}
				
				tv.make.offset.initialize();
				
				var offsetParent = elem.offsetParent, prevOffsetParent = elem,
					doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
					body = doc.body, defaultView = doc.defaultView,
					prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
					top = elem.offsetTop, left = elem.offsetLeft;
				
				while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
					if ( tv.make.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
						break;
					}
					
					computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
					top  -= elem.scrollTop;
					left -= elem.scrollLeft;
					
					if ( elem === offsetParent ) {
						top  += elem.offsetTop;
						left += elem.offsetLeft;
						
						if ( tv.make.offset.doesNotAddBorder && !(tv.make.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.nodeName)) ) {
							top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
							left += parseFloat( computedStyle.borderLeftWidth ) || 0;
						}
						
						prevOffsetParent = offsetParent, offsetParent = elem.offsetParent;
					}
					
					if ( tv.make.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
						top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
						left += parseFloat( computedStyle.borderLeftWidth ) || 0;
					}
					
					prevComputedStyle = computedStyle;
				}
				
				if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
					top  += body.offsetTop;
					left += body.offsetLeft;
				}
				
				if ( tv.make.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
					top  += Math.max( docElem.scrollTop, body.scrollTop );
					left += Math.max( docElem.scrollLeft, body.scrollLeft );
				}
				
				return { top: top, left: left };
			};
		}
		
		tv.make.position = function(elem) {
			
			// Get *real* offsetParent
			offsetParent = tv.make.offsetParent(elem),
			
			// Get correct offsets
			offset       = tv.make.offsetFor(elem),
			parentOffset = /^body|html$/i.test(offsetParent.nodeName) ? { top: 0, left: 0 } : tv.make.offsetFor(offsetParent);
			
			// Subtract element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft
			// are the same in Safari causing offset.left to incorrectly be 0
			offset.top  -= parseFloat( tv.make.curCSS(elem, "marginTop",  true) ) || 0;
			offset.left -= parseFloat( tv.make.curCSS(elem, "marginLeft", true) ) || 0;
			
			// Add offsetParent borders
			parentOffset.top  += parseFloat( tv.make.curCSS(offsetParent, "borderTopWidth",  true) ) || 0;
			parentOffset.left += parseFloat( tv.make.curCSS(offsetParent, "borderLeftWidth", true) ) || 0;
			
			// Subtract the two offsets
			return {
				top:  offset.top  - parentOffset.top,
				left: offset.left - parentOffset.left
			};
		};
		
		tv.make.offsetParent = function(elem) {
			var offsetParent = elem.offsetParent || document.body;
			while ( offsetParent && (!/^body|html$/i.test(offsetParent.nodeName) && tv.make.curCSS(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		};
	
	// ----------------------------------------------------------------------------
	// ----------------------------------------------------------------------------
	//                                END OF COPY
	// ----------------------------------------------------------------------------
	// ----------------------------------------------------------------------------
		
		tv.make.screen.listeningObjects = [];
		
		function getWindow( elem ) {
			return ("scrollTo" in elem && elem.document) ?
				elem :
				elem.nodeType === 9 ?
					elem.defaultView || elem.parentWindow :
					false;
		}
		
		tv.make.screen.updateGlobalStates = function() {
			tv.make.screen.replaceEmbedNodes();
		}
		window.setInterval( function() {
			var doc = window.document;
			
			var embedNodes = tv.make.direct.foundSWFs;
			for( var i = 0; i < embedNodes.length; ++i ) {
				var embedNode = embedNodes[i];
				
				try {
					var pos, width=0, height=0;
					var parentIsObject = embedNode.parentNode.nodeName.toLowerCase() == "object";
					if( parentIsObject && embedNode.parentNode.offsetWidth ) {
						pos = tv.make.position(embedNode.parentNode);
					} else {
						pos = tv.make.position(embedNode);
					}
					height = embedNode.offsetHeight || parentIsObject && embedNode.parentNode.offsetHeight;
					width = embedNode.offsetWidth || parentIsObject && embedNode.parentNode.offsetHeight;
					
					var invisible;
					var fullyVisible = true;
					
					
					var oL = pos.left;
					var oT = pos.top;
					
					var sL = (window.pageXOffset || document.body.scrollLeft || 0 );
					var sT = (window.pageYOffset || document.body.scrollTop || 0 );
					
					pos.left -= sL;
					pos.top -= sT;
					
					var right = pos.left + width;
					var bottom = pos.top + height;
					var partiallyBecause = "nothing"
					
					var current = embedNode.offsetParent || document.body;
					while( current ) {
						var overflow = tv.make.curCSS(current, "overflow");
						
						if( current == document.body || overflow == "auto" || overflow == "scroll" ) {
							var curPos,
								curWidth,
								curHeight;
							
							if( current == document.body ) {
								curWidth = window.innerWidth;
								curHeight = window.innerHeight;
								curPos = {left:0,top:0};
							} else {
								curWidth = current.offsetWidth;
								curHeight = current.offsetHeight;
								curPos = tv.make.position(current);
							}
							var curRight = curPos.left + curWidth;
							var curBottom = curPos.top + curHeight;
							if(
							       curPos.left >= right
								|| curPos.top >= bottom
								|| curRight < pos.left
								|| curBottom < pos.top ) {
								invisible = true;
								break;
							}
							if( curPos.left > pos.left ) {
								fullyVisible = false;
								partiallyBecause += "left";
								pos.left = curPos.left;
								width = right - pos.left;
							}
							if( curPos.top > pos.top ) {
								fullyVisible = false;
								pos.top = curPos.top;
								partiallyBecause += "top";
								height = bottom - pos.top;
							}
							if( curRight < right ) {
								fullyVisible = false;
								partiallyBecause += "right";
								width = curRight - pos.left;
							}
							if( curBottom < bottom ) {
								fullyVisible = false;
								partiallyBecause += "bottom";
								height = curBottom - pos.top;
							}
						}
						if( current != document.body ) {
							current = current.offsetParent || document.body;
						} else {
							break;
						}
					}
					
					var state;
					if( invisible ) {
						state = "NOT_VISIBLE";
					} else if( fullyVisible ) {
						state = "FULLY_VISIBLE";
					} else {
						state = "PARTIALLY_VISIBLE";
					}
					embedNode.tv_make_visibility_change( state );
				} catch( e ){
					alert("Error while handling: "+ e.message);
				};
			}
		}, 120 );
	}
}