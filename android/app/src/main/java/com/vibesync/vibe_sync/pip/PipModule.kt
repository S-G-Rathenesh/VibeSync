package com.vibesync.vibe_sync.pip

import android.app.PictureInPictureParams
import android.os.Build
import android.util.Rational
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.vibesync.vibe_sync.MainActivity

class PipModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        instance = this
    }

    companion object {
        private var instance: PipModule? = null
        var isPipEnabled: Boolean = false

        fun sendPipEvent(isInPip: Boolean) {
            instance?.let { module ->
                if (module.reactApplicationContext.hasActiveReactInstance()) {
                    val params = Arguments.createMap()
                    params.putBoolean("isInPip", isInPip)
                    module.reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onPipModeChanged", params)
                }
            }
        }
    }

    override fun getName(): String {
        return "PipModule"
    }

    @ReactMethod
    fun setPipEnabled(enabled: Boolean) {
        isPipEnabled = enabled
        val activity = currentActivity as? MainActivity
        activity?.runOnUiThread {
            activity.updatePipParams(enabled)
        }
    }

    @ReactMethod
    fun enterPip() {
        val activity = currentActivity as? MainActivity
        activity?.runOnUiThread {
            activity.enterPipMode()
        }
    }
}
