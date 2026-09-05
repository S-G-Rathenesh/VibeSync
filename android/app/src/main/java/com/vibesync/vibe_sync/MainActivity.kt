package com.vibesync.vibe_sync

import android.app.PictureInPictureParams
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import android.util.Rational

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.vibesync.vibe_sync.pip.PipModule

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (!moveTaskToBack(true)) {
          super.invokeDefaultOnBackPressed()
      }
  }

  fun updatePipParams(enabled: Boolean) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          try {
              val builder = PictureInPictureParams.Builder()
                  .setAspectRatio(Rational(16, 9))
              if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                  builder.setAutoEnterEnabled(enabled)
              }
              setPictureInPictureParams(builder.build())
          } catch (e: Exception) {
              e.printStackTrace()
          }
      }
  }

  fun enterPipMode() {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          try {
              val builder = PictureInPictureParams.Builder()
                  .setAspectRatio(Rational(16, 9))
              enterPictureInPictureMode(builder.build())
          } catch (e: Exception) {
              e.printStackTrace()
          }
      }
  }

  override fun onUserLeaveHint() {
      super.onUserLeaveHint()
      if (PipModule.isPipEnabled && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          if (!isInPictureInPictureMode) {
              enterPipMode()
          }
      }
  }

  override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean, newConfig: Configuration) {
      super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
      PipModule.sendPipEvent(isInPictureInPictureMode)
  }
}
