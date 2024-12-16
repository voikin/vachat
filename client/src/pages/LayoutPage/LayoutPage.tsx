import { Outlet } from 'react-router-dom'
import NavBar from '../../components/NavBar/NavBar'
import { Container } from '@mui/material'

const LayoutPage = () => {
	return (
		<>
			<NavBar />
			<Container sx={{ marginTop: '64px' }}>
				<Outlet />
			</Container>
		</>
	)
}

export default LayoutPage
