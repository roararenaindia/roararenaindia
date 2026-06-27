import Script from 'next/script'

function getGaMeasurementId() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim().toUpperCase()
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null
  return id
}

export default function GoogleAnalytics() {
  const measurementId = getGaMeasurementId()

  if (process.env.NODE_ENV !== 'production' || !measurementId) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  )
}
