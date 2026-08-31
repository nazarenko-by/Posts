// useWindowWidth.ts — реальний хук користувача (наданий 27.08.2026), без змін логіки.
"use client"
import { useState, useEffect } from "react"

const useWindowWidth = () => {
	const [width, setWidth] = useState(0)

	useEffect(() => {
		if (typeof window !== "undefined") {
			const handleResize = () => {
				setWidth(window.innerWidth)
			}
			handleResize()

			window.addEventListener("resize", handleResize)

			return () => {
				window.removeEventListener("resize", handleResize)
			}
		}
	}, [])

	return width
}

export default useWindowWidth
