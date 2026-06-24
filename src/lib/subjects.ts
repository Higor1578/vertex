import { demoSubjects } from './demoData';
import { loadLocal } from './localStore';
import type { Subject } from './types';

export function loadSubjects(extraNames: string[] = []) {
  const saved = loadLocal<Subject[]>('hg-subjects', demoSubjects);
  const names = new Set(saved.map((subject) => subject.name.toLowerCase()));
  const merged = [...saved];

  extraNames.forEach((rawName) => {
    const name = rawName.trim();
    const key = name.toLowerCase();
    if (name && !names.has(key)) {
      names.add(key);
      merged.push({ id: crypto.randomUUID(), name });
    }
  });

  return merged.sort((a, b) => a.name.localeCompare(b.name));
}
