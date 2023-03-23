import { useEffect, useState } from 'react'

/**
 * Use this hook to detect if the user is using a touch device.
 *
 * @returns Whether the user is using a touch device.
 */
export default function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    setIsTouchDevice('ontouchstart' in document.documentElement)
  }, [])

  return isTouchDevice
}
