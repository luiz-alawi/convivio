import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, Empty, ErrorState, Loading, Screen, TextField } from '@/components';
import { useUsers } from '@/hooks/queries';
import { roleLabels } from '@/lib/labels';
import { font, spacing } from '@/theme';

// Busca de pessoas por nome ou habilidade (ex.: freelancers de fotografia)
export default function CommunityScreen() {
  const [search, setSearch] = useState('');
  const users = useUsers(search.trim());

  return (
    <Screen scroll={false} edges={[]}>
      <FlatList
        data={users.data}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <TextField
            label="Buscar por nome ou habilidade"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        }
        ListEmptyComponent={
          users.isLoading ? (
            <Loading />
          ) : users.error ? (
            <ErrorState error={users.error} onRetry={users.refetch} />
          ) : (
            <Empty message="Ninguém encontrado." />
          )
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/usuario/${item.id}` as Href)}>
            <Text style={font.heading}>{item.name}</Text>
            <Text style={font.caption}>
              {roleLabels[item.role]}
              {item.course ? ` · ${item.course}` : ''}
            </Text>
            {item.skills.length > 0 && (
              <View>
                <Text style={font.caption}>{item.skills.join(' · ')}</Text>
              </View>
            )}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, gap: spacing.md },
});
