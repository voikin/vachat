import LoginForm from '../../components/LoginForm/LoginForm'
import styles from './LoginPage.module.css'


export default function LoginPage() {
	return (
		<>
			<section className={styles.wrapper}>
				<LoginForm />
			</section>
		</>
	)
}
