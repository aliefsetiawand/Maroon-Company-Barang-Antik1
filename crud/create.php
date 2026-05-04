<?php
include 'koneksi.php';

if (isset($_POST['submit'])) {

    $nama     = $_POST['nama'];
    $kategori = $_POST['kategori'];
    $harga    = $_POST['harga'];
    $tahun    = $_POST['tahun'];
    $asal     = $_POST['asal'];
    $kondisi  = $_POST['kondisi'];
    $unggulan = $_POST['unggulan'];
    $gambar   = $_POST['gambar'];
    $deskripsi= $_POST['deskripsi'];

    $query = "INSERT INTO barang 
        (nama_barang, kategori, harga, tahun, asal, kondisi, unggulan, gambar, deskripsi)
        VALUES 
        ('$nama','$kategori','$harga','$tahun','$asal','$kondisi','$unggulan','$gambar','$deskripsi')";

    if (mysqli_query($conn, $query)) {
        header("Location: index.php");
    } else {
        echo "Gagal tambah data";
    }
}
?>