import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <p className={styles.code} aria-hidden="true">404</p>
      <h1 className={styles.title}>Página não encontrada</h1>
      <p className={styles.description}>
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link href="/forms" className={styles.link}>
        Voltar para a home
      </Link>
    </div>
  );
}
