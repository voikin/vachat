import UserProfile from '../../components/UserProfile/UserProfile'
import styles from './UserProfilePage.module.css'

export default function UserProfilePage() {
	return (
		<>
			<section className={styles.wrapper}>
				<UserProfile />
			</section>
		</>
	)
}
