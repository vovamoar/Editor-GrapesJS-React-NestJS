import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function EditorLauncher() {
	const { site } = useParams<{ site: string }>()

	useEffect(() => {
		if (site) {
			window.location.href = `http://localhost:5001/editor/${site}`
		}
	}, [site])

	return (
		<div className='p-6 text-center text-lg'>
			Відкриваємо редактор <strong>{site}</strong>...
		</div>
	)
}
