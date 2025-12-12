"use client";

import {
  HelpCircle,
  MessageCircle,
  BookOpen,
  Star,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Bagaimana cara menambah menu baru?",
    answer:
      "Buka halaman Menu dari navigasi bawah, lalu tap tombol 'Tambah Menu'. Isi detail menu termasuk nama, kategori, harga jual, dan resep bahan.",
  },
  {
    question: "Bagaimana cara menghitung COGS?",
    answer:
      "COGS dihitung otomatis berdasarkan resep yang Anda buat. Pastikan harga bahan sudah diisi dengan benar di halaman Ingredients.",
  },
  {
    question: "Apa itu BEP dan ROI?",
    answer:
      "BEP (Break Even Point) adalah titik impas dimana pendapatan sama dengan total biaya. ROI (Return on Investment) menunjukkan berapa lama waktu yang dibutuhkan untuk balik modal.",
  },
  {
    question: "Bagaimana POS bekerja offline?",
    answer:
      "Ketika tidak ada koneksi internet, pesanan akan disimpan secara lokal. Setelah online kembali, pesanan akan otomatis disinkronkan ke server.",
  },
  {
    question: "Bagaimana cara melihat laporan penjualan?",
    answer:
      "Buka halaman Analitik dari menu More. Anda bisa melihat tren penjualan, menu terlaris, dan breakdown biaya. Export data ke CSV juga tersedia.",
  },
];

export function HelpCenter() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Bantuan
        </h1>
        <p className="text-sm text-muted-foreground">
          Panduan penggunaan SajiPlan
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Panduan</p>
            <p className="text-xs text-muted-foreground">Cara penggunaan</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Kontak</p>
            <p className="text-xs text-muted-foreground">Hubungi kami</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pertanyaan Umum (FAQ)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Rate App */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">Suka SajiPlan?</p>
              <p className="text-xs text-muted-foreground">
                Berikan rating untuk membantu kami berkembang
              </p>
            </div>
            <Button size="sm" variant="outline">
              <ExternalLink className="h-4 w-4 mr-1" />
              Rate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        SajiPlan v1.0.0 • Made with ❤️ for F&B entrepreneurs
      </p>
    </div>
  );
}

