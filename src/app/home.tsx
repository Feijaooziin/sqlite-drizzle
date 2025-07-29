import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as productSchema from "../database/schemas/productSchema";
import { like, eq, asc } from "drizzle-orm";

type Data = {
  id: number;
  name: string;
};

export function Home() {
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Data[]>([]);

  const database = useSQLiteContext();
  const db = drizzle(database, { schema: productSchema });

  async function fetchProducts() {
    try {
      const response = await db.query.product.findMany({
        where: like(productSchema.product.name, `%${search}%`),
        orderBy: [asc(productSchema.product.name)],
      });
      // console.log(response);
      setData(response);
    } catch (error) {
      console.log(error);
    }
  }

  async function add() {
    try {
      const response = await db.insert(productSchema.product).values({ name });
      Alert.alert(
        "Cadastro",
        "produto cadastardo com o ID: " + response.lastInsertRowId
      );
      setName("");
      await fetchProducts();
    } catch (error) {
      console.log(error);
    }
  }

  async function remove(id: number) {
    try {
      Alert.alert("Remover", "Deseja remover este item?", [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          onPress: async () => {
            await db
              .delete(productSchema.product)
              .where(eq(productSchema.product.id, id));

            await fetchProducts();
          },
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  async function show(id: number) {
    try {
      const product = await db.query.product.findFirst({
        where: eq(productSchema.product.id, id),
      });

      if (product) {
        Alert.alert(
          "Consulta:",
          `Produto ${product.name} \nCódigo: ${product.id}`
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [search]);

  return (
    <View style={{ flex: 1, padding: 32, gap: 16 }}>
      <TextInput
        style={{
          height: 54,
          borderWidth: 1,
          borderRadius: 8,
          borderColor: "#999",
          paddingHorizontal: 16,
        }}
        placeholder="Nome"
        onChangeText={setName}
        value={name}
      />

      <Button title="Salvar" onPress={add} />

      <TextInput
        style={{
          height: 54,
          borderWidth: 1,
          borderRadius: 8,
          borderColor: "#999",
          paddingHorizontal: 16,
          marginBottom: 48,
        }}
        placeholder="Pesquisar..."
        onChangeText={setSearch}
        value={search}
      />

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 16 }}
        ListEmptyComponent={() => <Text>Lista vazia</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={{ padding: 16, borderWidth: 1, borderRadius: 8 }}
            onPress={() => show(item.id)}
            onLongPress={() => remove(item.id)}
          >
            <Text>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
