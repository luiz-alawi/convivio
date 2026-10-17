import { createJobSchema, type JobType } from '@convivio/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Segmented, TextField } from '@/components';
import { useCreateJob } from '@/hooks/queries';
import { colors, fonts, pillarTheme, spacing } from '@/theme';

const typeOptions = [
  { value: 'vaga', label: 'Vaga', icon: 'briefcase-outline' },
  { value: 'freela', label: 'Freela', icon: 'flash-outline' },
] as const;

export default function NewJobScreen() {
  const create = useCreateJob();
  const [type, setType] = useState<JobType>('vaga');
  const [form, setForm] = useState({ title: '', description: '', contact: '', city: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChangeText: (text: string) => setForm((f) => ({ ...f, [key]: text })),
    error: errors[key],
  });

  function submit() {
    const parsed = createJobSchema.safeParse({ ...form, type, city: form.city || undefined });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    create.mutate(parsed.data, { onSuccess: () => router.back(), onError: (e) => setErrors({ form: e.message }) });
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Segmented options={typeOptions} value={type} onChange={setType} color={pillarTheme.trabalho.color} />
        <TextField label="Título" placeholder="Ex.: Recepcionista bilíngue" {...field('title')} />
        <TextField
          label="Descrição"
          placeholder="Atividades, horários, requisitos, remuneração…"
          multiline
          style={styles.description}
          {...field('description')}
        />
        <TextField label="Contato (e-mail ou telefone)" autoCapitalize="none" {...field('contact')} />
        <TextField label="Cidade (opcional)" {...field('city')} />
        {!!errors.form && <Text style={styles.error}>{errors.form}</Text>}
        <Button title="Publicar" icon="send" color={pillarTheme.trabalho.color} onPress={submit} loading={create.isPending} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  description: { minHeight: 120, textAlignVertical: 'top', paddingTop: spacing.md },
  error: { fontFamily: fonts.medium, color: colors.danger },
});
