
import { createClient } from '@supabase/supabase-js';
import { DailyEntry, FoodItem } from '../types';

// --- ECHTE SUPABASE-KONFIGURATION ---
// Kommentieren Sie dies ein, sobald Sie Ihre .env-Datei eingerichtet haben.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*
// --- MOCK-DATEN FÜR LOKALE ENTWICKLUNG ---
// Kommentieren Sie dies aus, wenn Sie eine Verbindung zu Supabase herstellen.
const mockDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

let mockFoodItems: FoodItem[] = [{id: 1, name: "Pizza"}, {id: 2, name: "Apfel"}, {id: 3, name: "Milch"}];
let mockDailyEntries: DailyEntry[] = [
    {id: 1, date: "2023-12-25", foods: ["Pizza", "Milch"], pill_taken: true, symptom_severity: 3},
    {id: 2, date: "2023-12-26", foods: ["Apfel"], pill_taken: false, symptom_severity: 8},
    {id: 3, date: "2023-12-27", foods: ["Pizza"], pill_taken: false, symptom_severity: 6},
];

export const supabase = {
    auth: {
        signUp: async ({ email, password }: any) => { await mockDelay(500); console.log("Mock SignUp:", email); return { data: { user: { id: "mock-user-id", email } }, error: null }; },
        signInWithPassword: async ({ email, password }: any) => { await mockDelay(500); console.log("Mock SignIn:", email); return { data: { session: { user: { id: "mock-user-id" } } }, error: null }; },
        signOut: async () => { await mockDelay(200); console.log("Mock SignOut"); return { error: null }; },
        getSession: async () => { await mockDelay(100); return { data: { session: null } }; } // oder eine mock session zurückgeben
    },
    from: (table: string) => ({
        select: async () => {
            await mockDelay(300);
            if (table === 'food_items') return { data: mockFoodItems, error: null };
            if (table === 'daily_entries') return { data: mockDailyEntries, error: null };
            return { data: [], error: { message: "Tabelle nicht gefunden" } };
        },
        insert: async (item: any) => {
            await mockDelay(300);
            const newItem = { ...item[0], id: Date.now() };
            if (table === 'food_items') mockFoodItems.push(newItem as FoodItem);
            if (table === 'daily_entries') mockDailyEntries.push(newItem as DailyEntry);
            return { data: [newItem], error: null };
        },
        delete: () => ({
            eq: async (column: string, value: any) => {
                await mockDelay(300);
                if (table === 'daily_entries') mockDailyEntries = mockDailyEntries.filter(e => e.id !== value);
                return { error: null };
            }
        }),
        update: (item: any) => ({
             eq: async (column: string, value: any) => {
                await mockDelay(300);
                if (table === 'daily_entries') {
                    const index = mockDailyEntries.findIndex(e => e.id === value);
                    if(index !== -1) mockDailyEntries[index] = {...mockDailyEntries[index], ...item };
                }
                return { data: [item], error: null };
            }
        })
    })
};
*/