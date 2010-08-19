package nanosome.integrate.browser.comm {
	
	import flash.events.EventDispatcher;
	import flash.external.ExternalInterface;
	import flash.utils.ByteArray;
	
	/**
	 * @author martin.heidegger
	 */
	public class JavaScriptModule extends EventDispatcher {
		
		[Embed(source="JavaScriptModule.js",mimeType="application/octet-stream")]
		private static const _commModule_raw: Class;
		private static const _commModule_BA: ByteArray =  ByteArray( new _commModule_raw() );
		private static const _commModule: String = _commModule_BA.readUTFBytes(_commModule_BA.length);
		
		private static var _communicationId: String;
		private static var _initialized: Boolean = false;
		private static var _globalId: uint = 0;
		private static var _tempId: uint;
		
		private static const _registry : Object = {};
		
		public static function initialize( rootUrl: String ): void {
			if( !_initialized && ExternalInterface.available ) {
				_initialized = true;
				ExternalInterface.marshallExceptions = true;
				try {
					ExternalInterface.call( _commModule );
				} catch(e:Error) {
				}
				_tempId = ExternalInterface.call( "nanosome.comm.tempId" );
				ExternalInterface.addCallback( "nanosome_tempId", getTempId );
				ExternalInterface.addCallback( "nanosome_call", call );
				_communicationId = ExternalInterface.call( "nanosome.comm.registerFlash", rootUrl, ExternalInterface.objectID, _tempId );
			}
		}
		
		public static function call( id: String, methodName: String, args: Array ): * {
			var module: JavaScriptModule = _registry[id];
			if( module ) {
				try {
					return Function( module[methodName] ).apply( module, args );
				} catch( e: Error ) {
					module.handleError( methodName, e );
				}
			}
			return null;
		}
		
		public static function getTempId(): uint {
			return _tempId;
		}
		
		private var _moduleId: String;
		
		private const _id: uint = ++_globalId;
		
		public function JavaScriptModule( jsCode: String, rootUrl: String ) {
			initialize( rootUrl );
			if( _communicationId ) {
				_moduleId = _communicationId + "::" + _id;
				_registry[ _moduleId ] = this;
				ExternalInterface.call( jsCode, _moduleId );
			}
		}
		
		public function call( methodName: String, ...args: Array ): * {
			return ExternalInterface.call.apply( ExternalInterface, [ "nanosome.comm.callModule", _moduleId, methodName, args ] );
		}
		
		public function handleError( methodName: String, originalError: Error ): void {
			throw new Error( "Error occured while trying to handle method call '"+methodName+"'. (Implement IJSModuleTarget to catch this exception)\n Error is: " + originalError );
		}
	}
}
