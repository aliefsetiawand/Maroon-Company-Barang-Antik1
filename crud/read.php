<?php include 'koneksi.php'; ?>

<h2>Data Barang Antik</h2>
<a href="form_tambah.php">+ Tambah Barang</a>

<table border="1" cellpadding="10">
<tr>
    <th>Nama</th>
    <th>Kategori</th>
    <th>Harga</th>
    <th>Aksi</th>
</tr>

<?php
$data = mysqli_query($conn, "SELECT * FROM barang");
while ($row = mysqli_fetch_assoc($data)) {
?>
<tr>
    <td><?= $row['nama_barang']; ?></td>
    <td><?= $row['kategori']; ?></td>
    <td><?= $row['harga']; ?></td>
    <td>
        <a href="edit.php?id=<?= $row['id']; ?>">Edit</a> |
        <a href="hapus.php?id=<?= $row['id']; ?>" onclick="return confirm('Hapus data?')">Hapus</a>
    </td>
</tr>
<?php } ?>

</table>