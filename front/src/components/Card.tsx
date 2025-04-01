import { Eye, Pencil } from 'lucide-react'
import React from 'react'

interface CardProps {
	siteName: string
}

const Card: React.FC<CardProps> = ({ siteName }) => {
	const handlePreview = () => {
		window.open(`http://localhost:5000/api/preview/${siteName}`, '_blank')
	}

	const handleEdit = () => {
		window.open(`http://localhost:5000/api/editor/${siteName}`, '_blank')
	}

	return (
		<div className='bg-white shadow-md rounded-2xl p-4 flex flex-col justify-between h-40 border border-gray-200'>
			<h3 className='text-xl font-semibold text-gray-800'>{siteName}</h3>
			<div className='flex space-x-4 mt-4'>
				<button
					onClick={handlePreview}
					className='flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition'
				>
					<Eye className='w-5 h-5 mr-2' />
					Preview
				</button>
				<button
					onClick={handleEdit}
					className='flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition'
				>
					<Pencil className='w-5 h-5 mr-2' />
					Edit
				</button>
			</div>
		</div>
	)
}

export default Card
