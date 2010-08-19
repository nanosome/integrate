package nanosome.integrate.browser.support {
	
	import flash.utils.ByteArray;
	import nanosome.integrate.browser.comm.JavaScriptModule;
	
	/**
	 * @author Martin Heidegger mh@leichtgewicht.at
	 */
	public class InBrowserVisibility extends JavaScriptModule {
		
		[Embed(source="InBrowserVisibility.js",mimeType="application/octet-stream")]
		private static const _js_raw: Class;
		private static const _js_BA: ByteArray =  ByteArray( new _js_raw() );
		private static const _js: String = _js_BA.readUTFBytes(_js_BA.length);
		
		public function InBrowserVisibility( rootUrl: String ) {
			super( _js, rootUrl );
		}
	}
}
