import axios from 'axios'
import { useEffect, useState } from 'react'
import Card from './Card'

const Home = () => {
	const [sites, setSites] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function fetchSites() {
			try {
				const res = await axios.get<string[]>('http://localhost:5001/api/sites')
				setSites(res.data)
			} catch {
				setError('❌ Error while fetching sites')
			} finally {
				setLoading(false)
			}
		}

		fetchSites()
	}, [])

	if (loading)
		return <div className='p-8 text-xl text-gray-600'>Loading...</div>
	if (error) return <div className='p-8 text-red-600'>{error}</div>

	return (
		<div className='p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
			{sites.map(site => (
				<Card key={site} siteName={site} />
			))}
		</div>
	)
}

export default Home
