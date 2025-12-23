import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DrillRunner from "./pages/DrillRunner";
import Summary from "./pages/Summary";
import ThreeSumRunner from "./pages/ThreeSumRunner";
import ThreeSumSummary from "./pages/ThreeSumSummary";
import ContainerRunner from "./pages/ContainerRunner";
import ContainerSummary from "./pages/ContainerSummary";
import PalindromeRunner from "./pages/PalindromeRunner";
import PalindromeSummary from "./pages/PalindromeSummary";
import ValidAnagramRunner from "./pages/ValidAnagramRunner";
import ValidAnagramSummary from "./pages/ValidAnagramSummary";
import GroupAnagramsRunner from "./pages/GroupAnagramsRunner";
import ContainsDuplicateRunner from "./pages/ContainsDuplicateRunner";
import TwoSumRunner from "./pages/TwoSumRunner";
import TopKFrequentRunner from "./pages/TopKFrequentRunner";
import EncodeDecodeRunner from "./pages/EncodeDecodeRunner";
import ProductArrayRunner from "./pages/ProductArrayRunner";
import ReverseLinkedListRunner from "./pages/ReverseLinkedListRunner";
import DesignLinkedListRunner from "./pages/DesignLinkedListRunner";
import InvertBinaryTreeRunner from "./pages/InvertBinaryTreeRunner";
import MaxDepthBinaryTreeRunner from "./pages/MaxDepthBinaryTreeRunner";
import SameTreeRunner from "./pages/SameTreeRunner";
import SubtreeOfAnotherTreeRunner from "./pages/SubtreeOfAnotherTreeRunner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/drill/two-pointers" element={<DrillRunner />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/drill/three-sum" element={<ThreeSumRunner />} />
          <Route path="/summary/three-sum" element={<ThreeSumSummary />} />
          <Route path="/drill/container" element={<ContainerRunner />} />
          <Route path="/summary/container" element={<ContainerSummary />} />
          <Route path="/drill/palindrome" element={<PalindromeRunner />} />
          <Route path="/summary/palindrome" element={<PalindromeSummary />} />
        <Route path="/drill/valid-anagram" element={<ValidAnagramRunner />} />
        <Route path="/summary/valid-anagram" element={<ValidAnagramSummary />} />
        <Route path="/drill/group-anagrams" element={<GroupAnagramsRunner />} />
          <Route path="/drill/contains-duplicate" element={<ContainsDuplicateRunner />} />
          <Route path="/drill/two-sum" element={<TwoSumRunner />} />
          <Route path="/drill/top-k-frequent" element={<TopKFrequentRunner />} />
          <Route path="/drill/encode-decode" element={<EncodeDecodeRunner />} />
          <Route path="/drill/product-array" element={<ProductArrayRunner />} />
          <Route path="/drill/reverse-linked-list" element={<ReverseLinkedListRunner />} />
          <Route path="/drill/design-linked-list" element={<DesignLinkedListRunner />} />
          <Route path="/drill/invert-binary-tree" element={<InvertBinaryTreeRunner />} />
          <Route path="/drill/max-depth-binary-tree" element={<MaxDepthBinaryTreeRunner />} />
          <Route path="/drill/same-tree" element={<SameTreeRunner />} />
          <Route path="/drill/subtree-of-another-tree" element={<SubtreeOfAnotherTreeRunner />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
