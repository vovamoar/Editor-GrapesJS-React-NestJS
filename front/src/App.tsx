import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Home from './components/Home'

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<Home />} />
			</Routes>
		</Router>
	)
}
