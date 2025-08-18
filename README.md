
# Allergy Tracker Pro - End-to-End Setup Guide

This guide provides a complete walkthrough to take this React application from a local project to a fully functional, database-backed, and hosted web application using Supabase and Netlify.

---

### **Schritt 1: Projekt lokal einrichten und ausführen**

1.  **Code herunterladen:** Legen Sie alle bereitgestellten Dateien in einem neuen Ordner auf Ihrem Computer ab.
2.  **Node.js installieren:** Stellen Sie sicher, dass Sie [Node.js](https://nodejs.org/) (Version 18 oder höher) installiert haben.
3.  **Abhängigkeiten installieren:** Öffnen Sie ein Terminal in Ihrem Projektordner und führen Sie die folgenden Befehle aus:

    ```bash
    npm install
    ```

    Dies installiert React und andere notwendige Pakete.

4.  **Projekt starten:** Führen Sie nach Abschluss der Installation den folgenden Befehl aus:

    ```bash
    npm run start
    ```

    Ihr Browser sollte sich öffnen und die Anwendung unter `http://localhost:3000` anzeigen. Derzeit verwendet die App Mock-Daten und ist nicht mit einer Datenbank verbunden.

---

### **Schritt 2: Supabase für Datenbank und Authentifizierung einrichten**

Supabase stellt unsere Datenbank (zum Speichern von Einträgen) und die Benutzerauthentifizierung (Login) bereit.

1.  **Supabase-Konto erstellen:** Gehen Sie zu [supabase.com](https://supabase.com/) und erstellen Sie ein kostenloses Konto.
2.  **Neues Projekt erstellen:**
    *   Klicken Sie im Supabase-Dashboard auf "New Project".
    *   Geben Sie Ihrem Projekt einen Namen (z. B. "Allergy Tracker") und erstellen Sie ein sicheres Datenbankpasswort.
    *   Wählen Sie eine Region in Ihrer Nähe (z. B. "Frankfurt").
    *   Klicken Sie auf "Create new project". Die Einrichtung dauert einige Minuten.
3.  **Datenbanktabellen erstellen:**
    *   Gehen Sie im Menü Ihres Projekts zu "Table Editor".
    *   Erstellen Sie eine Tabelle für die Lebensmittel:
        *   Klicken Sie auf "**+ New table**".
        *   Tabellenname: `food_items`
        *   Deaktivieren Sie "Enable Row Level Security (RLS)" für den Moment (wir aktivieren es später).
        *   Spalten:
            *   `id` (bleibt Standard: `int8`, Primary Key)
            *   `created_at` (bleibt Standard: `timestamptz`)
            *   `name` (Typ: `text`)
            *   `user_id` (Typ: `uuid`, dies verknüpft das Lebensmittel mit einem Benutzer)
    *   Erstellen Sie eine Tabelle für die täglichen Einträge:
        *   Klicken Sie auf "**+ New table**".
        *   Tabellenname: `daily_entries`
        *   Deaktivieren Sie RLS.
        *   Spalten:
            *   `id` (Standard)
            *   `created_at` (Standard)
            *   `date` (Typ: `date`)
            *   `foods` (Typ: `text[]` - ein Array aus Text)
            *   `pill_taken` (Typ: `bool`)
            *   `symptom_severity` (Typ: `int4`)
            *   `user_id` (Typ: `uuid`)
4.  **Row Level Security (RLS) aktivieren:** RLS ist ein wichtiges Sicherheitsmerkmal. Es stellt sicher, dass Benutzer nur ihre eigenen Daten sehen und bearbeiten können.
    *   Gehen Sie im Menü zu "Authentication" -> "Policies".
    *   Klicken Sie bei der `food_items`-Tabelle auf "**Enable RLS**".
    *   Klicken Sie auf "**New Policy**" -> "**Get started quickly**" -> "**Enable read access to everyone**" und verwenden Sie diese Vorlage. Ändern Sie die Policy-Definition zu: `(auth.uid() = user_id)`. Geben Sie ihr einen Namen wie "Users can manage their own food items." und aktivieren Sie `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
    *   Wiederholen Sie den Vorgang für die `daily_entries`-Tabelle.
5.  **API-Schlüssel abrufen:**
    *   Gehen Sie im Menü zu "Project Settings" -> "API".
    *   Hier finden Sie Ihre **Project URL** und Ihren `anon` **public** API Key. Sie benötigen beide im nächsten Schritt.

---

### **Schritt 3: React-App mit Supabase verbinden**

1.  **Umgebungsvariablen erstellen:**
    *   Erstellen Sie im Hauptverzeichnis Ihres Projekts eine neue Datei mit dem Namen `.env`.
    *   Fügen Sie Ihre Supabase-Anmeldeinformationen in diese Datei ein:

    ```
    REACT_APP_SUPABASE_URL=IHRE_PROJEKT_URL_HIER
    REACT_APP_SUPABASE_ANON_KEY=IHR_ANON_PUBLIC_KEY_HIER
    ```

    **Wichtig:** Fügen Sie die `.env`-Datei zu Ihrer `.gitignore`-Datei hinzu, damit Ihre Schlüssel nicht versehentlich auf GitHub hochgeladen werden!

2.  **Supabase-Logik implementieren:**
    *   Öffnen Sie die Datei `src/services/supabaseService.ts`.
    *   Kommentieren Sie die Mock-Daten aus und kommentieren Sie den echten Supabase-Client-Code ein. Der Code ist bereits vorbereitet und verwendet die von Ihnen erstellten Umgebungsvariablen. Er wird automatisch funktionieren, sobald die `.env`-Datei korrekt ist.
    *   Das Gleiche gilt für die Authentifizierungsfunktionen in `src/contexts/AuthContext.tsx`.

---

### **Schritt 4: Projekt mit GitHub und Netlify bereitstellen**

1.  **GitHub-Repository erstellen:**
    *   Erstellen Sie ein neues Repository auf [GitHub](https://github.com/).
    *   Folgen Sie den Anweisungen, um Ihr lokales Projekt in dieses Repository zu pushen.
2.  **Netlify-Konto erstellen:** Gehen Sie zu [netlify.com](https://netlify.com/) und registrieren Sie sich (Sie können Ihr GitHub-Konto verwenden).
3.  **Neue Seite von Git bereitstellen:**
    *   Klicken Sie im Netlify-Dashboard auf "Add new site" -> "Import an existing project".
    *   Verbinden Sie sich mit GitHub und wählen Sie das Repository aus, das Sie gerade erstellt haben.
4.  **Build-Einstellungen konfigurieren:**
    *   Netlify erkennt in der Regel, dass es sich um eine React-App handelt. Die Standardeinstellungen sollten korrekt sein:
        *   **Build command:** `npm run build`
        *   **Publish directory:** `build`
5.  **Umgebungsvariablen in Netlify hinzufügen:**
    *   Gehen Sie zu "Site settings" -> "Build & deploy" -> "Environment".
    *   Fügen Sie die gleichen Schlüssel wie in Ihrer `.env`-Datei hinzu:
        *   `REACT_APP_SUPABASE_URL` mit Ihrer Supabase-Projekt-URL als Wert.
        *   `REACT_APP_SUPABASE_ANON_KEY` mit Ihrem Supabase anon public key als Wert.
6.  **Bereitstellung auslösen:**
    *   Klicken Sie auf "Deploy site". Netlify wird Ihren Code von GitHub abrufen, die App erstellen und sie im Internet hosten.
    *   Sie erhalten eine eindeutige URL (z. B. `irgendwas-zufälliges.netlify.app`), unter der Ihre Anwendung live ist.

Sie haben jetzt eine voll funktionsfähige, sichere Webanwendung mit einer echten Datenbank und Authentifizierung, die im Internet gehostet wird!
