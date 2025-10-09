import { boot } from 'quasar/wrappers'
import { VueReCaptcha } from 'vue-recaptcha-v3'
import { RECAPTCHA_SITE_KEY, RECAPTCHA_OPTIONS } from 'src/config/recaptcha'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }) => {
    // Initialize reCAPTCHA v3
    app.use(VueReCaptcha, {
        siteKey: RECAPTCHA_SITE_KEY,
        loaderOptions: RECAPTCHA_OPTIONS,
    })

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
        console.log('✅ reCAPTCHA v3 initialized with site key:', RECAPTCHA_SITE_KEY)
    }
})
