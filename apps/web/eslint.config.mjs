import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

export default tseslint.config(...nextVitals, ...tseslint.configs.recommended);
