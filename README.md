# Mfumo wa JobCard (Ticket System) - Appwrite & GitHub

Mfumo huu umeundwa kwa ajili ya usimamizi wa tiketi za matengenezo (Maintenance) na TEHAMA (ICT) kutoka kwenye idara mbalimbali (HouseKeeping, Reception, Accounts, General Manager, HR, Restaurant, Kitchen, Store).

## Mafaili Yaliyopo
- `index.html` - Muundo mkuu wa kurasa (Login, User Dashboard, Admin Dashboard, Print Modal).
- `style.css` - Mitindo na rangi za status (Receive: Blue, Pending: Orange, Progress: Blue, Done: Kijani).
- `app.js` - Mantiki ya mfumo, barua pepe za idara, sababu za Pending, na sehemu ya Appwrite IDs.

## Hatua za Kupakia GitHub na Appwrite Auto-Deployment
1. **Unzip** faili hili kwenye kompyuta yako.
2. Fungua **GitHub Repository** mpya na pakia mafaili yote (`index.html`, `style.css`, `app.js`, `README.md`) kwenye **root directory** (`main` branch).
3. Nenda kwenye **Appwrite Console > Sites > Create Site** na uunganishe GitHub repository yako.
4. Kwenye Build Settings za Appwrite Sites:
   - **Framework:** `Static`
   - **Build Command:** *(Acha wazi)*
   - **Output Directory:** `./`
5. Bofya **Deploy**. Kila ukibadilisha kodi GitHub, Appwrite itajisasisha yenyewe.
