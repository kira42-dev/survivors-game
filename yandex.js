const YandexSDK = {
  ysdk: null,
  ready: false,
  _callbacks: {},

  init() {
    if (typeof window.ysdk === 'undefined') {
      this.ready = false;
      return;
    }
    this.ysdk = window.ysdk;
    this.ready = true;
    try { this.ysdk.features.LoadingAPI.ready(); } catch (e) {}
  },

  showInterstitial(callback) {
    if (!this.ready || !this.ysdk) {
      if (callback) callback();
      return;
    }
    try {
      this.ysdk.adv.showFullscreenAdv({
        callbacks: {
          onClose: function(wasShown) {
            if (callback) callback();
          },
        },
      });
    } catch (e) {
      if (callback) callback();
    }
  },

  showRewarded(callback) {
    if (!this.ready || !this.ysdk) {
      if (callback) callback(false);
      return;
    }
    try {
      this.ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: function() {},
          onRewarded: function() {
            if (callback) callback(true);
          },
          onClose: function() {
            if (callback) callback(false);
          },
        },
      });
    } catch (e) {
      if (callback) callback(false);
    }
  },

  getPlayer() {
    if (!this.ready || !this.ysdk) return null;
    try { return this.ysdk.getPlayer(); } catch (e) { return null; }
  },
};
