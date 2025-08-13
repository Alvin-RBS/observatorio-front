export function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  return rev === parseInt(cpf[10]);
}

export function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const t = cnpj.length - 2;
  const d = cnpj.substring(t);
  const d1 = parseInt(d[0]);
  const d2 = parseInt(d[1]);

  const calc = (x: number) => {
    const n = cnpj.substring(0, x); 
    let y = x - 7;
    let s = 0;
    for (let i = x; i >= 1; i--) {
      s += parseInt(n[x - i]) * y--;
      if (y < 2) y = 9;
    }
    const r = 11 - (s % 11); 
    return r > 9 ? 0 : r;
  };

  return calc(t) === d1 && calc(t + 1) === d2;
}
