// useDeviceType.ts — реальний хук користувача (наданий 27.08.2026), без змін логіки.
import { useEffect, useState } from "react"

const getDeviceType = () => {
	const ua = navigator.userAgent.toLowerCase()

	if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
		return "mobile"
	} else if (/tablet|ipad/i.test(ua)) {
		return "tablet"
	} else {
		return "desktop"
	}
}

const useDeviceType = () => {
	const [device, setDevice] = useState(() => getDeviceType())
	const [orientation, setOrientation] = useState("")

	useEffect(() => {
		const handleResize = () => {
			setDevice(getDeviceType())
			setOrientation(screen.orientation?.type || window.screen.orientation?.type || "")
		}

		handleResize()

		window.addEventListener("resize", handleResize)

		return () => {
			window.removeEventListener("resize", handleResize)
		}
	}, [])

	return { device, orientation: orientation?.toLowerCase() }
}

export default useDeviceType
