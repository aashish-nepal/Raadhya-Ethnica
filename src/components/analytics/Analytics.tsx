"use client";

import { useEffect } from "react";
import { useSettingsContext } from "@/contexts/SettingsContext";

export default function Analytics() {
    const { settings } = useSettingsContext();

    useEffect(() => {
        // Load Google Analytics if configured
        if (settings?.seo.googleAnalyticsId) {
            const gaId = settings.seo.googleAnalyticsId;

            // Add GA script
            const script1 = document.createElement("script");
            script1.async = true;
            script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            document.head.appendChild(script1);

            // Add GA config
            const script2 = document.createElement("script");
            script2.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
            `;
            document.head.appendChild(script2);
        }

        // Load Facebook Pixel if configured
        if (settings?.seo.facebookPixelId) {
            const fbPixelId = settings.seo.facebookPixelId;

            const script = document.createElement("script");
            script.innerHTML = `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbPixelId}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(script);

            // Add noscript pixel
            const noscript = document.createElement("noscript");
            noscript.innerHTML = `<img height="1" width="1" style="display:none"
                src="https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1" />`;
            document.body.appendChild(noscript);
        }
    }, [settings]);

    return null; // This component doesn't render anything
}
