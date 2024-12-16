
import SignupForm from '../../components/SignupForm/SignupForm'
import styles from './SignupPage.module.css'

export default function SignupPage() {
	return (
		<>
			<section className={styles.wrapper}>
				<SignupForm />
			</section>
		</>
	)
}
