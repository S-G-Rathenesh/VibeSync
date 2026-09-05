import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { PipModule } = NativeModules;

class PipService {
  private emitter: NativeEventEmitter | null = null;

  constructor() {
    if (Platform.OS === 'android' && PipModule) {
      this.emitter = new NativeEventEmitter(PipModule);
    }
  }

  setPipEnabled(enabled: boolean) {
    if (Platform.OS === 'android' && PipModule?.setPipEnabled) {
      try {
        PipModule.setPipEnabled(enabled);
      } catch (e) {
        console.warn('PipModule setPipEnabled error:', e);
      }
    }
  }

  enterPip() {
    if (Platform.OS === 'android' && PipModule?.enterPip) {
      try {
        PipModule.enterPip();
      } catch (e) {
        console.warn('PipModule enterPip error:', e);
      }
    }
  }

  subscribePipMode(callback: (isInPip: boolean) => void): () => void {
    if (Platform.OS === 'android' && this.emitter) {
      const subscription = this.emitter.addListener('onPipModeChanged', (data: { isInPip: boolean }) => {
        callback(Boolean(data?.isInPip));
      });
      return () => {
        subscription.remove();
      };
    }
    return () => {};
  }
}

export const pipService = new PipService();
